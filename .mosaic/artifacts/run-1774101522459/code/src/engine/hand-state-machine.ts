// ============================================================
// HandStateMachine — Manages hand lifecycle from deal to settlement
// ============================================================

import type {
  Card,
  HandPlayer,
  HandState,
  ActionLogEntry,
  PlayerAction,
  Position,
  Street,
  BlindStructure,
  Player,
} from '../types';
import { MAX_PLAYERS } from '../types';
import { DeckManager } from './deck-manager';
import {
  type BettingState,
  applyAction,
  getLegalActions,
  isBettingRoundComplete,
  resetForNewStreet,
} from './betting-round';
import { PotManager } from './pot-manager';

/** 6-max position assignment from dealer seat */
const POSITION_ORDER: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];

const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

export interface HandConfig {
  sessionId: string;
  handNumber: number;
  dealerSeat: number;
  players: Player[];
  blinds: BlindStructure;
  humanSeat: number;
}

export class HandStateMachine {
  private deck: DeckManager;
  private potManager: PotManager;
  private bettingState!: BettingState;
  private actionLog: ActionLogEntry[] = [];
  private holeCards: Map<number, Card[]> = new Map();

  readonly handId: string;
  readonly config: HandConfig;
  state: HandState;

  constructor(config: HandConfig) {
    this.config = config;
    this.handId = crypto.randomUUID();
    this.deck = new DeckManager();
    this.potManager = new PotManager();

    // Initialize hand state
    this.state = {
      id: this.handId,
      sessionId: config.sessionId,
      handNumber: config.handNumber,
      phase: 'preflop',
      players: this.initHandPlayers(config),
      communityCards: [],
      pots: [{ amount: 0, eligibleSeats: [] }],
      currentActingSeat: null,
      dealerSeat: config.dealerSeat,
      userHoleCards: [],
    };

    // Initialize pot manager
    const activeSeats = this.state.players
      .filter((p) => !this.config.players[p.seat]?.isSittingOut)
      .map((p) => p.seat);
    this.potManager.reset(activeSeats);
  }

  /** Deal cards, post blinds, and begin the hand. */
  startHand(): HandState {
    this.deck.shuffle();
    this.dealHoleCards();
    this.postBlinds();
    this.bettingState = this.createPreflopBettingState();
    this.state.currentActingSeat = this.findFirstActor('preflop');
    this.state.pots = this.potManager.calculatePots();
    return this.getState();
  }

  /** Get a copy of current state (with hidden cards masked). */
  getState(): HandState {
    return {
      ...this.state,
      players: this.state.players.map((p) => ({
        ...p,
        holeCards: p.seat === this.config.humanSeat ? this.holeCards.get(p.seat) ?? null : null,
      })),
      userHoleCards: this.holeCards.get(this.config.humanSeat) ?? [],
    };
  }

  /** Get full state with all hole cards revealed (for showdown/settlement). */
  getFullState(): HandState {
    return {
      ...this.state,
      players: this.state.players.map((p) => ({
        ...p,
        holeCards: this.holeCards.get(p.seat) ?? null,
      })),
      userHoleCards: this.holeCards.get(this.config.humanSeat) ?? [],
    };
  }

  /** Get the hole cards for a specific seat. */
  getHoleCards(seat: number): Card[] | null {
    return this.holeCards.get(seat) ?? null;
  }

  /** Get all hole cards (for settlement). */
  getAllHoleCards(): Map<number, Card[]> {
    return new Map(this.holeCards);
  }

  /** Process a player action and advance state. */
  processAction(seat: number, action: PlayerAction): {
    actionLog: ActionLogEntry;
    isHandComplete: boolean;
    advancedStreet: boolean;
  } {
    if (this.state.phase === 'showdown' || this.state.phase === 'settled') {
      throw new Error('Hand is already complete');
    }

    if (this.state.currentActingSeat !== seat) {
      throw new Error(`It is not seat ${seat}'s turn to act (current: ${this.state.currentActingSeat})`);
    }

    const player = this.state.players.find((p) => p.seat === seat);
    if (!player) {
      throw new Error(`Player at seat ${seat} not found`);
    }

    // Validate action is legal
    const legalActions = getLegalActions(player, this.bettingState);
    const isLegal = legalActions.some((la) => la.type === action.type);
    if (!isLegal) {
      throw new Error(`Action '${action.type}' is not legal for seat ${seat}. Legal: ${legalActions.map((a) => a.type).join(', ')}`);
    }

    // Apply the action
    const { chipsPut, newBetLevel } = applyAction(player, action, this.bettingState);

    // Update pot manager
    if (chipsPut > 0) {
      this.potManager.addContribution(seat, chipsPut);
    }
    if (action.type === 'fold') {
      this.potManager.markFolded(seat);
    }
    if (player.isAllIn) {
      this.potManager.markAllIn(seat);
    }

    // Update betting state
    if (newBetLevel > this.bettingState.currentBet) {
      const raiseIncrement = newBetLevel - this.bettingState.currentBet;
      this.bettingState.minRaiseIncrement = Math.max(this.bettingState.minRaiseIncrement, raiseIncrement);
      this.bettingState.currentBet = newBetLevel;
      this.bettingState.lastRaiserSeat = seat;
      // Reset acted seats — everyone needs to act again after a raise
      this.bettingState.actedSeats = new Set([seat]);
    } else {
      this.bettingState.actedSeats.add(seat);
    }

    // Log the action
    const logEntry: ActionLogEntry = {
      seat,
      playerName: player.name,
      action: action.type,
      amount: chipsPut > 0 ? chipsPut : null,
      street: this.state.phase as Street,
      potAfter: this.potManager.getTotalPot(),
      timestamp: new Date().toISOString(),
    };
    this.actionLog.push(logEntry);

    // Update pots
    this.state.pots = this.potManager.calculatePots();

    // Check if only one active player remains (everyone else folded)
    const activePlayers = this.state.players.filter((p) => p.isActive);
    if (activePlayers.length === 1) {
      this.state.phase = 'showdown';
      this.state.currentActingSeat = null;
      return { actionLog: logEntry, isHandComplete: true, advancedStreet: false };
    }

    // Check if betting round is complete
    let advancedStreet = false;
    if (isBettingRoundComplete(this.state.players, this.bettingState)) {
      advancedStreet = this.advanceStreet();
      if ((this.state.phase as string) === 'showdown') {
        return { actionLog: logEntry, isHandComplete: true, advancedStreet };
      }
    } else {
      // Move to next active player
      this.state.currentActingSeat = this.findNextActor(seat);
    }

    return { actionLog: logEntry, isHandComplete: false, advancedStreet };
  }

  /** Get the action history for this hand. */
  getActionLog(): ActionLogEntry[] {
    return [...this.actionLog];
  }

  /** Get the pot manager for settlement. */
  getPotManager(): PotManager {
    return this.potManager;
  }

  /** Mark hand as settled. */
  markSettled(): void {
    this.state.phase = 'settled';
    this.state.currentActingSeat = null;
  }

  /** Update a player's stack after settlement. */
  updatePlayerStack(seat: number, newStack: number): void {
    const player = this.state.players.find((p) => p.seat === seat);
    if (player) {
      player.stackBB = newStack;
    }
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private initHandPlayers(config: HandConfig): HandPlayer[] {
    const players: HandPlayer[] = [];
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const source = config.players[i];
      if (!source) continue;
      players.push({
        seat: source.seat,
        name: source.name,
        stackBB: source.stackBB,
        position: this.assignPosition(source.seat, config.dealerSeat),
        isActive: !source.isSittingOut && source.stackBB > 0,
        isAllIn: false,
        currentBet: 0,
        holeCards: null,
        lastAction: null,
      });
    }
    return players;
  }

  private assignPosition(seat: number, dealerSeat: number): Position {
    const offset = (seat - dealerSeat + MAX_PLAYERS) % MAX_PLAYERS;
    return POSITION_ORDER[offset];
  }

  private dealHoleCards(): void {
    for (const player of this.state.players) {
      if (player.isActive) {
        const cards = this.deck.dealMany(2);
        this.holeCards.set(player.seat, cards);
      }
    }
  }

  private postBlinds(): void {
    const sb = this.state.players.find((p) => p.position === 'SB');
    const bb = this.state.players.find((p) => p.position === 'BB');

    if (sb && sb.isActive) {
      const sbAmount = Math.min(this.config.blinds.smallBlind, sb.stackBB);
      sb.stackBB -= sbAmount;
      sb.currentBet = sbAmount;
      if (sb.stackBB === 0) sb.isAllIn = true;
      this.potManager.addContribution(sb.seat, sbAmount);
    }

    if (bb && bb.isActive) {
      const bbAmount = Math.min(this.config.blinds.bigBlind, bb.stackBB);
      bb.stackBB -= bbAmount;
      bb.currentBet = bbAmount;
      if (bb.stackBB === 0) bb.isAllIn = true;
      this.potManager.addContribution(bb.seat, bbAmount);
    }
  }

  private createPreflopBettingState(): BettingState {
    return {
      currentBet: this.config.blinds.bigBlind,
      minRaiseIncrement: this.config.blinds.bigBlind,
      lastRaiserSeat: null,
      activeBettors: this.state.players.filter((p) => p.isActive && !p.isAllIn).length,
      actedSeats: new Set<number>(),
      street: 'preflop',
      bigBlind: this.config.blinds.bigBlind,
    };
  }

  /** Find the first player to act on a street. */
  private findFirstActor(street: Street): number | null {
    if (street === 'preflop') {
      // Preflop: first to act is UTG (seat after BB)
      return this.findNextActiveFrom('BB');
    }
    // Postflop: first to act is first active player after dealer (SB or next)
    return this.findNextActiveFrom('BTN');
  }

  /** Find the next active player after a given position. */
  private findNextActiveFrom(afterPosition: Position): number | null {
    const afterPlayer = this.state.players.find((p) => p.position === afterPosition);
    if (!afterPlayer) return null;
    return this.findNextActor(afterPlayer.seat);
  }

  /** Find the next active, non-all-in player after the given seat. */
  private findNextActor(afterSeat: number): number | null {
    const activePlayers = this.state.players.filter((p) => p.isActive && !p.isAllIn);
    if (activePlayers.length === 0) return null;

    // Sort by seat order starting from afterSeat + 1
    for (let i = 1; i <= MAX_PLAYERS; i++) {
      const nextSeat = (afterSeat + i) % MAX_PLAYERS;
      const player = activePlayers.find((p) => p.seat === nextSeat);
      if (player) return player.seat;
    }

    return null;
  }

  /** Advance to the next street. Returns true if advanced, false if showdown. */
  private advanceStreet(): boolean {
    const currentStreetIdx = STREET_ORDER.indexOf(this.state.phase as Street);

    // Check if all active players are all-in (or only one non-all-in)
    const activePlayers = this.state.players.filter((p) => p.isActive);
    const activeNotAllIn = activePlayers.filter((p) => !p.isAllIn);

    // If river is complete, go to showdown
    if (currentStreetIdx >= STREET_ORDER.length - 1) {
      this.state.phase = 'showdown';
      this.state.currentActingSeat = null;
      return true;
    }

    const nextStreet = STREET_ORDER[currentStreetIdx + 1];

    // Deal community cards
    this.dealCommunityCards(nextStreet);

    // Update phase
    this.state.phase = nextStreet;

    // If 0 or 1 active non-all-in players, run out remaining streets automatically
    if (activeNotAllIn.length <= 1) {
      // Run out remaining community cards
      return this.runOutBoard();
    }

    // Reset betting for new street
    this.bettingState = resetForNewStreet(
      this.state.players,
      nextStreet,
      this.config.blinds.bigBlind
    );

    // Find first actor for new street
    this.state.currentActingSeat = this.findFirstActor(nextStreet);
    return true;
  }

  /** Deal community cards for a street. */
  private dealCommunityCards(street: Street): void {
    if (street === 'flop') {
      this.deck.burn();
      const cards = this.deck.dealMany(3);
      this.state.communityCards.push(...cards);
    } else if (street === 'turn' || street === 'river') {
      this.deck.burn();
      this.state.communityCards.push(this.deck.deal());
    }
  }

  /** Run out the remaining board when all players are all-in. */
  private runOutBoard(): boolean {
    const currentStreetIdx = STREET_ORDER.indexOf(this.state.phase as Street);

    // Deal remaining streets
    for (let i = currentStreetIdx + 1; i < STREET_ORDER.length; i++) {
      this.dealCommunityCards(STREET_ORDER[i]);
    }

    this.state.phase = 'showdown';
    this.state.currentActingSeat = null;
    return true;
  }
}
