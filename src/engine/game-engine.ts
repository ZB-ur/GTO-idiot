// ============================================================
// GTO Idiot — Game Engine
// 6-max Texas Hold'em state machine.
// Manages hand lifecycle: deal → preflop → flop → turn → river → showdown
// ============================================================

import type {
  BlindsConfig,
  Card,
  HandState,
  HandStatus,
  PlayerActionRequest,
  PlayerState,
  Position,
  ShowdownResult,
  Street,
  ActionTaken,
} from '../types';
import { Deck } from './deck';
import { evaluateHand, describeHand } from './hand-evaluator';
import { validateAction, getAvailableActions, computeMinRaise, computeMaxRaise } from './action-validator';
import { collectBets, distributePots, distributeToLastStanding } from './pot-calculator';

// ============================================================
// Constants
// ============================================================

const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

/** Position assignments by table size. Index 0 = dealer offset. */
const POSITION_ORDERS: Record<number, Position[]> = {
  2: ['BTN', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'UTG'],
  5: ['BTN', 'SB', 'BB', 'UTG', 'HJ'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
};

// ============================================================
// Types
// ============================================================

export interface GameConfig {
  blinds: BlindsConfig;
  playerCount: number;       // 2-6
  heroSeat: number;          // The user's seat (0-based)
  startingStacks: number[];  // Stack per seat
  playerNames: string[];     // Name per seat
  botFlags: boolean[];       // true = bot, false = human
  dealerSeat: number;        // BTN seat
}

export interface ActionOutcome {
  handState: HandState;
  actionTaken: ActionTaken;
  handComplete: boolean;
  showdown: ShowdownResult | null;
}

// ============================================================
// Game Engine
// ============================================================

export class GameEngine {
  private deck: Deck;
  private state: HandState;
  private config: GameConfig;
  private handId: string;
  private sessionId: string;
  private handNumber: number;
  private highestBet: number;
  private _lastAggressor: number | null;
  private actedThisRound: Set<number>;
  /** Tracks the last raise increment size for min-raise calculation */
  private lastRaiseIncrement: number;
  /** All hole cards (including bot cards hidden from UI) */
  private allHoleCards: Map<number, Card[]>;

  /** Seat of the last player who raised or bet */
  get lastAggressor(): number | null {
    return this._lastAggressor;
  }

  constructor(
    sessionId: string,
    handNumber: number,
    config: GameConfig,
  ) {
    if (config.playerCount < 2 || config.playerCount > 6) {
      throw new Error(`Player count must be 2-6, got ${config.playerCount}`);
    }
    if (config.startingStacks.length !== config.playerCount) {
      throw new Error('startingStacks length must match playerCount');
    }

    this.sessionId = sessionId;
    this.handNumber = handNumber;
    this.config = config;
    this.handId = `${sessionId}-h${handNumber}`;
    this.deck = new Deck();
    this.highestBet = 0;
    this.lastRaiseIncrement = config.blinds.big_blind;
    this._lastAggressor = null;
    this.actedThisRound = new Set();
    this.allHoleCards = new Map();

    // Initialize state
    this.state = this.createInitialState();
  }

  // ============================================================
  // Initialization
  // ============================================================

  private createInitialState(): HandState {
    const players = this.createPlayers();

    return {
      id: this.handId,
      session_id: this.sessionId,
      hand_number: this.handNumber,
      street: 'preflop',
      pot: 0,
      community_cards: [],
      players,
      current_player_seat: null,
      dealer_seat: this.config.dealerSeat,
      is_user_turn: false,
      available_actions: [],
      min_raise: null,
      max_raise: null,
      status: 'in_progress',
    };
  }

  private createPlayers(): PlayerState[] {
    const players: PlayerState[] = [];
    const positions = this.assignPositions();

    for (let i = 0; i < this.config.playerCount; i++) {
      players.push({
        seat: i,
        name: this.config.playerNames[i],
        position: positions[i],
        stack: this.config.startingStacks[i],
        hole_cards: null,
        is_active: true,
        is_all_in: false,
        is_bot: this.config.botFlags[i],
        current_bet: 0,
        total_invested: 0,
        last_action: null,
      });
    }

    return players;
  }

  /**
   * Assign positions based on dealer seat and player count.
   * For 6-max: BTN, SB, BB, UTG, HJ, CO (clockwise from dealer).
   * For heads-up: BTN/SB, BB.
   */
  private assignPositions(): Position[] {
    const n = this.config.playerCount;
    const order = POSITION_ORDERS[n];
    const positions: Position[] = new Array(n);

    for (let i = 0; i < n; i++) {
      const offset = (i - this.config.dealerSeat + n) % n;
      positions[i] = order[offset];
    }

    return positions;
  }

  // ============================================================
  // Hand lifecycle
  // ============================================================

  /**
   * Start the hand: post blinds, deal hole cards, set first actor.
   */
  startHand(): HandState {
    this.postBlinds();
    this.dealHoleCards();
    this.setFirstActor();
    return this.getVisibleState();
  }

  private postBlinds(): void {
    const { small_blind, big_blind } = this.config.blinds;
    const n = this.config.playerCount;

    let sbSeat: number;
    let bbSeat: number;

    if (n === 2) {
      // Heads-up: BTN posts SB, other posts BB
      sbSeat = this.config.dealerSeat;
      bbSeat = (this.config.dealerSeat + 1) % n;
    } else {
      sbSeat = (this.config.dealerSeat + 1) % n;
      bbSeat = (this.config.dealerSeat + 2) % n;
    }

    this.placeBet(sbSeat, Math.min(small_blind, this.state.players[sbSeat].stack));
    this.placeBet(bbSeat, Math.min(big_blind, this.state.players[bbSeat].stack));

    this.highestBet = big_blind;
    this.lastRaiseIncrement = big_blind;
  }

  private dealHoleCards(): void {
    for (const player of this.state.players) {
      if (player.is_active) {
        const cards = this.deck.deal(2);
        this.allHoleCards.set(player.seat, cards);
        // Only set visible hole cards for the hero
        if (player.seat === this.config.heroSeat) {
          player.hole_cards = cards;
        }
      }
    }
  }

  /**
   * Set the first player to act preflop (UTG, or SB in heads-up).
   */
  private setFirstActor(): void {
    const n = this.config.playerCount;
    let firstSeat: number;

    if (n === 2) {
      // Heads-up: BTN/SB acts first preflop
      firstSeat = this.config.dealerSeat;
    } else {
      // First active player after BB
      const bbSeat = (this.config.dealerSeat + 2) % n;
      firstSeat = this.findNextActiveSeat(bbSeat);
    }

    this.state.current_player_seat = firstSeat;
    this.actedThisRound.clear();
    this.updateAvailableActions();
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Execute a player action. Returns the outcome.
   */
  performAction(request: PlayerActionRequest): ActionOutcome {
    const seat = this.state.current_player_seat;
    if (seat === null) {
      throw new Error('No active player');
    }

    const player = this.state.players[seat];
    const validation = validateAction(
      this.state, player, request, this.highestBet, this.config.blinds.big_blind,
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const actionTaken = this.applyAction(seat, request);

    // Check if only one player remains (everyone else folded)
    const activePlayers = this.state.players.filter((p) => p.is_active);
    if (activePlayers.length === 1) {
      const showdown = this.resolveHand();
      this.updateAvailableActions();
      return {
        handState: this.getVisibleState(),
        actionTaken,
        handComplete: true,
        showdown,
      };
    }

    // Check if the betting round is complete
    if (this.isRoundComplete()) {
      // Check if we need to go to showdown (all-in scenario or river complete)
      if (this.shouldGoToShowdown()) {
        // Run out remaining community cards and resolve
        this.runOutRemainingBoard();
        const showdown = this.resolveHand();
        this.updateAvailableActions();
        return {
          handState: this.getVisibleState(),
          actionTaken,
          handComplete: true,
          showdown,
        };
      }

      // Advance to next street
      this.advanceStreet();
    } else {
      this.advanceToNextPlayer();
    }

    this.updateAvailableActions();

    return {
      handState: this.getVisibleState(),
      actionTaken,
      handComplete: false,
      showdown: null,
    };
  }

  /**
   * Determine if the hand should go to showdown after the round is complete.
   */
  private shouldGoToShowdown(): boolean {
    const activePlayers = this.state.players.filter((p) => p.is_active);
    const activeNonAllIn = activePlayers.filter((p) => !p.is_all_in);

    // On the river, always go to showdown
    if (this.state.street === 'river') return true;

    // All active players are all-in
    if (activeNonAllIn.length === 0) return true;

    // Only one non-all-in player left with at least one all-in opponent
    if (activeNonAllIn.length === 1 && activePlayers.length > 1) return true;

    return false;
  }

  private applyAction(seat: number, request: PlayerActionRequest): ActionTaken {
    const player = this.state.players[seat];
    let actionAmount: number | null = null;

    switch (request.action) {
      case 'fold':
        player.is_active = false;
        player.last_action = 'fold';
        break;

      case 'check':
        player.last_action = 'check';
        break;

      case 'call': {
        const toCall = Math.min(this.highestBet - player.current_bet, player.stack);
        this.placeBet(seat, toCall);
        actionAmount = toCall;
        player.last_action = `call ${toCall}`;
        if (player.stack === 0) {
          player.is_all_in = true;
        }
        break;
      }

      case 'raise': {
        const raiseTotal = request.amount!;
        const raiseAmount = raiseTotal - player.current_bet;
        const raiseIncrement = raiseTotal - this.highestBet;
        this.placeBet(seat, raiseAmount);
        actionAmount = raiseTotal;
        this.lastRaiseIncrement = Math.max(raiseIncrement, this.lastRaiseIncrement);
        this.highestBet = raiseTotal;
        this._lastAggressor = seat;
        player.last_action = `raise to ${raiseTotal}`;
        if (player.stack === 0) {
          player.is_all_in = true;
        }
        // Reset acted set — everyone needs to act again after a raise
        this.actedThisRound.clear();
        break;
      }

      case 'all_in': {
        const allInAmount = player.stack;
        const newBet = player.current_bet + allInAmount;
        this.placeBet(seat, allInAmount);
        actionAmount = newBet;
        player.is_all_in = true;
        player.last_action = `all-in ${newBet}`;

        if (newBet > this.highestBet) {
          const raiseIncrement = newBet - this.highestBet;
          this.lastRaiseIncrement = Math.max(raiseIncrement, this.lastRaiseIncrement);
          this.highestBet = newBet;
          this._lastAggressor = seat;
          this.actedThisRound.clear();
        }
        break;
      }
    }

    this.actedThisRound.add(seat);

    return {
      player_seat: seat,
      player_name: player.name,
      action: request.action,
      amount: actionAmount,
      street: this.state.street,
    };
  }

  private placeBet(seat: number, amount: number): void {
    const player = this.state.players[seat];
    const actualAmount = Math.min(amount, player.stack);
    player.stack -= actualAmount;
    player.current_bet += actualAmount;
    player.total_invested += actualAmount;
  }

  // ============================================================
  // Round / street management
  // ============================================================

  private isRoundComplete(): boolean {
    const activePlayers = this.state.players.filter(
      (p) => p.is_active && !p.is_all_in,
    );

    // If only one active (non-all-in) player or zero, round is complete
    if (activePlayers.length <= 1) return true;

    // All active players must have acted and matched the highest bet
    return activePlayers.every(
      (p) => this.actedThisRound.has(p.seat) && p.current_bet === this.highestBet,
    );
  }

  private advanceStreet(): void {
    // Collect bets into pot
    const { newPot, players } = collectBets(this.state.pot, this.state.players);
    this.state.pot = newPot;
    this.state.players = players;
    this.highestBet = 0;
    this.lastRaiseIncrement = this.config.blinds.big_blind;
    this._lastAggressor = null;
    this.actedThisRound.clear();

    const currentIdx = STREET_ORDER.indexOf(this.state.street);
    if (currentIdx >= STREET_ORDER.length - 1) return;

    this.state.street = STREET_ORDER[currentIdx + 1];

    // Deal community cards
    switch (this.state.street) {
      case 'flop':
        this.state.community_cards = this.deck.deal(3);
        break;
      case 'turn':
        this.state.community_cards.push(this.deck.dealOne());
        break;
      case 'river':
        this.state.community_cards.push(this.deck.dealOne());
        break;
    }

    // Reset last actions
    for (const p of this.state.players) {
      p.last_action = null;
    }

    // Set first actor post-flop: first active player after dealer
    this.setPostflopFirstActor();
  }

  /**
   * Deal remaining community cards when no more action is possible (all-in runout).
   */
  private runOutRemainingBoard(): void {
    // Collect any outstanding bets first
    const { newPot, players } = collectBets(this.state.pot, this.state.players);
    this.state.pot = newPot;
    this.state.players = players;

    // Deal remaining community cards
    if (this.state.community_cards.length === 0) {
      this.state.community_cards = this.deck.deal(3);
      this.state.street = 'flop';
    }
    while (this.state.community_cards.length < 5) {
      this.state.community_cards.push(this.deck.dealOne());
      if (this.state.community_cards.length === 4) {
        this.state.street = 'turn';
      } else if (this.state.community_cards.length === 5) {
        this.state.street = 'river';
      }
    }

    this.state.current_player_seat = null;
  }

  private setPostflopFirstActor(): void {
    const n = this.config.playerCount;
    let startSeat: number;

    if (n === 2) {
      // Heads-up: BB acts first postflop (non-dealer)
      startSeat = (this.config.dealerSeat + 1) % n;
      const player = this.state.players[startSeat];
      if (player.is_active && !player.is_all_in) {
        this.state.current_player_seat = startSeat;
        return;
      }
      // If BB is out, dealer acts
      this.state.current_player_seat = this.findNextActiveSeat(startSeat);
    } else {
      // First active non-all-in player after dealer (clockwise)
      startSeat = this.config.dealerSeat;
      this.state.current_player_seat = this.findNextActiveSeat(startSeat);
    }
  }

  private advanceToNextPlayer(): void {
    if (this.state.current_player_seat === null) return;

    const nextSeat = this.findNextActiveSeat(this.state.current_player_seat);

    // If we've come back to the same player, round is complete
    if (nextSeat === this.state.current_player_seat) {
      this.state.current_player_seat = null;
      return;
    }

    this.state.current_player_seat = nextSeat;
  }

  /**
   * Find the next active (not folded, not all-in) player after the given seat.
   */
  private findNextActiveSeat(afterSeat: number): number {
    const n = this.config.playerCount;
    for (let i = 1; i <= n; i++) {
      const seat = (afterSeat + i) % n;
      const player = this.state.players[seat];
      if (player.is_active && !player.is_all_in) {
        return seat;
      }
    }
    // No active non-all-in player found; return afterSeat as fallback
    return afterSeat;
  }

  // ============================================================
  // Hand resolution
  // ============================================================

  private resolveHand(): ShowdownResult {
    // Collect remaining bets
    const { newPot, players } = collectBets(this.state.pot, this.state.players);
    this.state.pot = newPot;
    this.state.players = players;

    const activePlayers = this.state.players.filter((p) => p.is_active);

    // If only one player left (all others folded)
    if (activePlayers.length === 1) {
      this.state.status = 'completed';
      this.state.current_player_seat = null;
      const dist = distributeToLastStanding(this.state.players);

      // Update stacks
      for (const [seat, stack] of dist.updatedStacks) {
        this.state.players[seat].stack = stack;
      }

      return {
        winners: dist.winners.map((w) => ({
          seat: w.seat,
          name: w.name,
          amount_won: w.amount_won,
          hand_rank: w.hand_rank || undefined,
        })),
        players_shown: [],
      };
    }

    // Showdown: reveal all active players' cards
    this.state.status = 'showdown';

    // Run out remaining community cards if needed
    while (this.state.community_cards.length < 5) {
      this.state.community_cards.push(this.deck.dealOne());
    }

    // Set hole cards for all active players (reveal at showdown)
    for (const p of this.state.players) {
      if (p.is_active || p.is_all_in) {
        const cards = this.allHoleCards.get(p.seat);
        if (cards) {
          p.hole_cards = cards;
        }
      }
    }

    // Distribute pots
    const dist = distributePots(this.state.players, this.state.community_cards);

    // Update stacks
    for (const [seat, stack] of dist.updatedStacks) {
      this.state.players[seat].stack = stack;
    }

    this.state.status = 'completed';
    this.state.current_player_seat = null;
    this.state.pot = 0;

    const playersShown = this.state.players
      .filter((p) => (p.is_active || p.is_all_in) && p.hole_cards)
      .map((p) => {
        const allCards = [...p.hole_cards!, ...this.state.community_cards];
        const evaluated = allCards.length >= 5 ? evaluateHand(allCards) : null;
        return {
          seat: p.seat,
          hole_cards: p.hole_cards!,
          hand_rank: evaluated ? describeHand(evaluated) : undefined,
        };
      });

    return {
      winners: dist.winners.map((w) => ({
        seat: w.seat,
        name: w.name,
        amount_won: w.amount_won,
        hand_rank: w.hand_rank || undefined,
      })),
      players_shown: playersShown,
    };
  }

  // ============================================================
  // State queries
  // ============================================================

  private updateAvailableActions(): void {
    const seat = this.state.current_player_seat;
    if (seat === null || this.state.status !== 'in_progress') {
      this.state.is_user_turn = false;
      this.state.available_actions = [];
      this.state.min_raise = null;
      this.state.max_raise = null;
      return;
    }

    const player = this.state.players[seat];
    this.state.is_user_turn = seat === this.config.heroSeat;
    this.state.available_actions = getAvailableActions(
      this.state, player, this.highestBet, this.config.blinds.big_blind,
    );

    const minRaise = computeMinRaise(this.state, player, this.highestBet, this.config.blinds.big_blind);
    this.state.min_raise = minRaise;
    this.state.max_raise = player.stack > 0 ? computeMaxRaise(player) : null;
  }

  /**
   * Get the game state visible to the hero (hides bot hole cards unless showdown).
   */
  getVisibleState(): HandState {
    return { ...this.state };
  }

  /**
   * Get all hole cards (for internal use, e.g., bot decision making).
   */
  getHoleCards(seat: number): Card[] | undefined {
    return this.allHoleCards.get(seat);
  }

  /** Get current street */
  getStreet(): Street {
    return this.state.street;
  }

  /** Get hand ID */
  getHandId(): string {
    return this.handId;
  }

  /** Check if it's a specific seat's turn */
  isSeatTurn(seat: number): boolean {
    return this.state.current_player_seat === seat;
  }

  /** Get the current highest bet */
  getHighestBet(): number {
    return this.highestBet;
  }

  /** Get hand status */
  getStatus(): HandStatus {
    return this.state.status;
  }

  /** Get all player states (internal) */
  getPlayers(): PlayerState[] {
    return this.state.players;
  }

  /** Get big blind amount */
  getBigBlind(): number {
    return this.config.blinds.big_blind;
  }

  /** Get community cards */
  getCommunityCards(): Card[] {
    return this.state.community_cards;
  }

  /** Get current pot */
  getPot(): number {
    return this.state.pot;
  }

  /** Get hero seat */
  getHeroSeat(): number {
    return this.config.heroSeat;
  }
}
