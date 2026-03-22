import type {
  ActionRecord,
  ActionResult,
  AvailableActions,
  BlindStructure,
  Card,
  HandHistory,
  HandPlayerInfo,
  HandResult,
  HandState,
  Player,
  PlayerAction,
  PotInfo,
  Position,
  Street,
  StreetRecord,
  WinnerInfo,
} from '../types';
import { DEFAULT_BLINDS } from '../types';
import { Deck } from './deck';
import { evaluateHand, compareHands, getHandDescription } from './hand-evaluator';
import { collectBetsIntoPot, getTotalPot } from './pot-calculator';
import {
  createBettingRound,
  getAvailableActions,
  processAction,
  getNextPlayerIndex,
  isEveryoneFolded,
  type BettingRoundState,
} from './betting-round';

export interface GameEngineState {
  handId: string;
  handNumber: number;
  sessionId: string;
  deck: Deck;
  players: Player[];
  communityCards: Card[];
  street: Street;
  pot: PotInfo;
  bettingRound: BettingRoundState;
  currentPlayerIndex: number;
  dealerIndex: number;
  humanPlayerIndex: number;
  blinds: BlindStructure;
  actionTimestamp: number;
  allActions: ActionRecord[];
  streetRecords: StreetRecord[];
  isComplete: boolean;
  winnerInfo?: WinnerInfo;
}

/**
 * Core game engine orchestrating a single hand of Texas Hold'em.
 */
export class GameEngine {
  private state: GameEngineState;

  constructor(
    sessionId: string,
    handNumber: number,
    players: Player[],
    dealerIndex: number,
    humanPlayerIndex: number,
    blinds: BlindStructure = DEFAULT_BLINDS
  ) {
    const handId = `${sessionId}-h${handNumber}`;
    const deck = new Deck();

    // Reset players for new hand
    const handPlayers = players.map((p, i) => ({
      ...p,
      isActive: p.chipStack > 0,
      isFolded: p.chipStack <= 0,
      isAllIn: false,
      currentBet: 0,
      holeCards: undefined as [Card, Card] | undefined,
      isDealer: i === dealerIndex,
      position: this.assignPosition(i, dealerIndex, players.length) as Position,
    }));

    this.state = {
      handId,
      handNumber,
      sessionId,
      deck,
      players: handPlayers,
      communityCards: [],
      street: 'preflop',
      pot: { mainPot: 0 },
      bettingRound: createBettingRound('preflop', blinds.bigBlind),
      currentPlayerIndex: -1,
      dealerIndex,
      humanPlayerIndex,
      blinds,
      actionTimestamp: 0,
      allActions: [],
      streetRecords: [],
      isComplete: false,
    };
  }

  /**
   * Start the hand: post blinds, deal hole cards, set first to act.
   */
  startHand(): HandState {
    this.postBlinds();
    this.dealHoleCards();
    this.setFirstToAct();
    return this.getHandState();
  }

  /**
   * Get available actions for the current player.
   */
  getAvailableActions(): AvailableActions {
    const player = this.state.players[this.state.currentPlayerIndex];
    return getAvailableActions(
      player,
      this.state.bettingRound,
      getTotalPot(this.state.pot) + this.currentRoundBets(),
      this.state.players
    );
  }

  /**
   * Process a player action. Returns the action result including any subsequent BOT actions.
   */
  submitAction(action: PlayerAction): ActionResult {
    const processedActions: ActionRecord[] = [];

    // Process the submitted action
    const record = this.executeAction(this.state.currentPlayerIndex, action);
    processedActions.push(record);

    // Check for hand-ending conditions
    if (this.checkHandEnd()) {
      return { handState: this.getHandState(), processedActions };
    }

    // Advance to next player or next street
    this.advanceGameState();

    // If hand ended after advancing (e.g., everyone folded)
    if (this.state.isComplete) {
      return { handState: this.getHandState(), processedActions };
    }

    // Run BOT actions until it's the human's turn or hand ends
    const botActions = this.runBotActions();
    processedActions.push(...botActions);

    return { handState: this.getHandState(), processedActions };
  }

  /**
   * Get current hand state (for UI rendering).
   */
  getHandState(): HandState {
    return {
      handId: this.state.handId,
      handNumber: this.state.handNumber,
      street: this.state.street,
      pot: {
        mainPot: this.state.pot.mainPot + this.currentRoundBets(),
        sidePots: this.state.pot.sidePots,
      },
      players: this.state.players.map((p, i) => ({
        ...p,
        // Hide BOT hole cards unless hand is complete
        holeCards: (i === this.state.humanPlayerIndex || this.state.isComplete)
          ? p.holeCards
          : undefined,
      })),
      communityCards: [...this.state.communityCards],
      isHumanTurn: this.state.currentPlayerIndex === this.state.humanPlayerIndex && !this.state.isComplete,
      isHandComplete: this.state.isComplete,
      currentPlayerIndex: this.state.currentPlayerIndex,
      recentActions: this.state.allActions.slice(-10),
      winnerInfo: this.state.winnerInfo,
      humanHandStrength: this.getHumanHandStrength(),
    };
  }

  /**
   * Build complete hand history for persistence.
   */
  getHandHistory(): HandHistory {
    const playerInfos: HandPlayerInfo[] = this.state.players.map(p => ({
      playerId: p.id,
      name: p.name,
      position: p.position,
      startingStack: p.chipStack + p.currentBet, // approximate
      holeCards: p.holeCards ?? [{ rank: '2', suit: 'clubs' }, { rank: '2', suit: 'clubs' }] as [Card, Card],
      isBot: p.isBot,
    }));

    const result: HandResult = {
      winners: this.state.winnerInfo?.winners.map(w => ({
        playerId: w.playerId,
        amountWon: w.amount,
        handRank: w.handRank,
      })) ?? [],
      potTotal: getTotalPot(this.state.pot),
      humanNetResult: this.getHumanNetResult(),
      wentToShowdown: this.state.street === 'showdown',
    };

    return {
      handId: this.state.handId,
      sessionId: this.state.sessionId,
      handNumber: this.state.handNumber,
      startedAt: new Date().toISOString(),
      players: playerInfos,
      streets: this.state.streetRecords,
      result,
    };
  }

  /**
   * Get the underlying engine state (for session state persistence).
   */
  getRawState(): GameEngineState {
    return this.state;
  }

  // ─── Private Methods ──────────────────────────────────────────

  private assignPosition(playerIdx: number, dealerIdx: number, totalPlayers: number): string {
    const offset = (playerIdx - dealerIdx + totalPlayers) % totalPlayers;
    // BTN=0, SB=1, BB=2, UTG=3, HJ=4, CO=5
    const positionMap: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
    return positionMap[offset] ?? 'UTG';
  }

  private postBlinds(): void {
    const { players, dealerIndex, blinds } = this.state;
    const n = players.length;

    const sbIdx = (dealerIndex + 1) % n;
    const bbIdx = (dealerIndex + 2) % n;

    // Find actual SB and BB (skip busted players)
    const sbPlayer = players[sbIdx];
    const bbPlayer = players[bbIdx];

    if (sbPlayer.isActive) {
      const sbAmount = Math.min(blinds.smallBlind, sbPlayer.chipStack);
      sbPlayer.chipStack -= sbAmount;
      sbPlayer.currentBet = sbAmount;
      if (sbPlayer.chipStack === 0) sbPlayer.isAllIn = true;
    }

    if (bbPlayer.isActive) {
      const bbAmount = Math.min(blinds.bigBlind, bbPlayer.chipStack);
      bbPlayer.chipStack -= bbAmount;
      bbPlayer.currentBet = bbAmount;
      if (bbPlayer.chipStack === 0) bbPlayer.isAllIn = true;
    }
  }

  private dealHoleCards(): void {
    const { deck, players } = this.state;
    for (const player of players) {
      if (player.isActive) {
        player.holeCards = deck.dealMany(2) as [Card, Card];
      }
    }
  }

  private setFirstToAct(): void {
    const { dealerIndex, players } = this.state;
    const n = players.length;
    // Preflop: first to act is UTG (3 seats after dealer)
    const utgIdx = (dealerIndex + 3) % n;

    // Find first active player starting from UTG
    for (let offset = 0; offset < n; offset++) {
      const idx = (utgIdx + offset) % n;
      if (players[idx].isActive && !players[idx].isFolded && !players[idx].isAllIn) {
        this.state.currentPlayerIndex = idx;
        return;
      }
    }
    this.state.currentPlayerIndex = -1;
  }

  private executeAction(playerIndex: number, action: PlayerAction): ActionRecord {
    const potSize = getTotalPot(this.state.pot);
    const { updatedRound, actionRecord } = processAction(
      playerIndex,
      this.state.players,
      action,
      this.state.bettingRound,
      potSize,
      this.state.actionTimestamp++
    );
    this.state.bettingRound = updatedRound;
    this.state.allActions.push(actionRecord);
    return actionRecord;
  }

  private checkHandEnd(): boolean {
    // Everyone folded except one
    if (isEveryoneFolded(this.state.players)) {
      this.resolveHandByFold();
      return true;
    }
    return false;
  }

  private advanceGameState(): void {
    const { players, bettingRound } = this.state;
    const nextIdx = getNextPlayerIndex(this.state.currentPlayerIndex, players, bettingRound);

    if (nextIdx === -1) {
      // Betting round complete — move to next street
      this.endBettingRound();
      this.advanceStreet();
    } else {
      this.state.currentPlayerIndex = nextIdx;
    }
  }

  private endBettingRound(): void {
    // Record street actions
    const streetActions = this.state.allActions.filter(a => a.street === this.state.street);
    this.state.streetRecords.push({
      street: this.state.street,
      communityCards: this.getCommunityCardsForStreet(),
      actions: streetActions,
      potAtEnd: getTotalPot(this.state.pot) + this.currentRoundBets(),
    });

    // Collect bets into pot
    this.state.pot = collectBetsIntoPot(this.state.pot, this.state.players);

    // Reset current bets
    for (const p of this.state.players) {
      p.currentBet = 0;
    }
  }

  private getCommunityCardsForStreet(): Card[] {
    switch (this.state.street) {
      case 'flop':
        return this.state.communityCards.slice(0, 3);
      case 'turn':
        return [this.state.communityCards[3]];
      case 'river':
        return [this.state.communityCards[4]];
      default:
        return [];
    }
  }

  private advanceStreet(): void {
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    const currentIdx = streetOrder.indexOf(this.state.street);
    const nextStreet = streetOrder[currentIdx + 1];

    if (!nextStreet || nextStreet === 'showdown') {
      this.goToShowdown();
      return;
    }

    this.state.street = nextStreet;
    this.dealCommunityCards(nextStreet);

    // Check if we can actually have a betting round
    const activeBettors = this.state.players.filter(p => !p.isFolded && !p.isAllIn);
    if (activeBettors.length < 2) {
      // Everyone is all-in or folded — just deal remaining cards
      this.runOutBoard();
      return;
    }

    this.state.bettingRound = createBettingRound(nextStreet, this.state.blinds.bigBlind);

    // Postflop: first to act is first active player after dealer
    this.setPostflopFirstToAct();
  }

  private dealCommunityCards(street: Street): void {
    const { deck } = this.state;
    deck.burn();
    switch (street) {
      case 'flop':
        this.state.communityCards.push(...deck.dealMany(3));
        break;
      case 'turn':
      case 'river':
        this.state.communityCards.push(deck.deal());
        break;
    }
  }

  private runOutBoard(): void {
    // Deal remaining community cards without betting
    while (this.state.communityCards.length < 5) {
      const nextStreet = this.state.communityCards.length < 3 ? 'flop'
        : this.state.communityCards.length === 3 ? 'turn' : 'river';

      if (nextStreet === 'flop') {
        this.state.deck.burn();
        this.state.communityCards.push(...this.state.deck.dealMany(3));
      } else {
        this.state.deck.burn();
        this.state.communityCards.push(this.state.deck.deal());
      }
    }
    this.goToShowdown();
  }

  private setPostflopFirstToAct(): void {
    const { dealerIndex, players } = this.state;
    const n = players.length;

    // Start from SB (one after dealer)
    for (let offset = 1; offset <= n; offset++) {
      const idx = (dealerIndex + offset) % n;
      if (players[idx].isActive && !players[idx].isFolded && !players[idx].isAllIn) {
        this.state.currentPlayerIndex = idx;
        return;
      }
    }
    // No active players — should not happen
    this.state.currentPlayerIndex = -1;
  }

  private resolveHandByFold(): void {
    const winner = this.state.players.find(p => !p.isFolded);
    if (!winner) return;

    // Collect remaining bets
    this.endBettingRound();

    winner.chipStack += getTotalPot(this.state.pot);

    this.state.winnerInfo = {
      winners: [{
        playerId: winner.id,
        amount: getTotalPot(this.state.pot),
        handRank: 'Everyone folded',
        holeCards: winner.holeCards,
      }],
    };

    this.state.isComplete = true;
    this.state.street = 'showdown';
  }

  private goToShowdown(): void {
    this.state.street = 'showdown';

    // Evaluate all non-folded players
    const contenders = this.state.players
      .filter(p => !p.isFolded && p.holeCards)
      .map(p => ({
        player: p,
        hand: evaluateHand(p.holeCards!, this.state.communityCards),
      }));

    // Sort by hand strength (best first)
    contenders.sort((a, b) => compareHands(b.hand, a.hand));

    if (contenders.length === 0) {
      this.state.isComplete = true;
      return;
    }

    // Determine winners (may be multiple in case of tie)
    const bestHand = contenders[0].hand;
    const winners = contenders.filter(c => compareHands(c.hand, bestHand) === 0);

    const totalPot = getTotalPot(this.state.pot);
    const share = totalPot / winners.length;

    this.state.winnerInfo = {
      winners: winners.map(w => ({
        playerId: w.player.id,
        amount: share,
        handRank: getHandDescription(w.hand),
        holeCards: w.player.holeCards,
      })),
    };

    // Distribute winnings
    for (const w of winners) {
      w.player.chipStack += share;
    }

    // Record showdown street
    this.state.streetRecords.push({
      street: 'showdown',
      communityCards: this.state.communityCards,
      actions: [],
      potAtEnd: totalPot,
    });

    this.state.isComplete = true;
  }

  private runBotActions(): ActionRecord[] {
    const actions: ActionRecord[] = [];

    while (
      !this.state.isComplete &&
      this.state.currentPlayerIndex !== this.state.humanPlayerIndex &&
      this.state.currentPlayerIndex >= 0
    ) {
      const player = this.state.players[this.state.currentPlayerIndex];
      if (player.isFolded || player.isAllIn) {
        this.advanceGameState();
        continue;
      }

      const botAction = this.decideBotAction(this.state.currentPlayerIndex);
      const record = this.executeAction(this.state.currentPlayerIndex, botAction);
      actions.push(record);

      if (this.checkHandEnd()) break;
      this.advanceGameState();
    }

    return actions;
  }

  /**
   * Simple BOT decision logic. Uses basic strategy:
   * - Preflop: call/raise with decent hands, fold with trash
   * - Postflop: bet with strong hands, check/call with medium, fold with weak
   */
  private decideBotAction(playerIndex: number): PlayerAction {
    const player = this.state.players[playerIndex];
    const amountToCall = this.state.bettingRound.currentBet - player.currentBet;

    if (!player.holeCards) {
      return { actionType: 'fold' };
    }

    // Simple strategy based on hand strength
    const rand = Math.random();

    if (this.state.street === 'preflop') {
      return this.botPreflopAction(player, amountToCall, rand);
    } else {
      return this.botPostflopAction(player, amountToCall, rand);
    }
  }

  private botPreflopAction(player: Player, amountToCall: number, rand: number): PlayerAction {
    const cards = player.holeCards!;
    const isPair = cards[0].rank === cards[1].rank;
    const highCardCount = cards.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank)).length;
    const isSuited = cards[0].suit === cards[1].suit;

    // Strong hand: raise
    if (isPair || highCardCount === 2 || (highCardCount === 1 && isSuited)) {
      if (rand < 0.3 && amountToCall <= this.state.blinds.bigBlind * 6) {
        const raiseAmount = this.state.bettingRound.currentBet + this.state.blinds.bigBlind * 2.5;
        return { actionType: 'raise', amount: Math.min(raiseAmount, player.chipStack + player.currentBet) };
      }
      if (amountToCall <= player.chipStack) {
        return { actionType: 'call' };
      }
    }

    // Medium hand: call small bets
    if (highCardCount >= 1 || isSuited) {
      if (amountToCall <= this.state.blinds.bigBlind * 3 && amountToCall <= player.chipStack) {
        return { actionType: 'call' };
      }
    }

    // Weak hand or facing large bet
    if (amountToCall === 0) {
      return { actionType: 'check' };
    }

    // Small chance of bluff
    if (rand < 0.1 && amountToCall <= this.state.blinds.bigBlind * 2) {
      return { actionType: 'call' };
    }

    return { actionType: 'fold' };
  }

  private botPostflopAction(player: Player, amountToCall: number, rand: number): PlayerAction {
    if (!player.holeCards) return { actionType: 'fold' };

    const hand = evaluateHand(player.holeCards, this.state.communityCards);
    const potSize = getTotalPot(this.state.pot) + this.currentRoundBets();

    // Strong hand (two pair+): bet or raise
    if (hand.rank >= 2) {
      if (amountToCall === 0) {
        // Bet
        const betSize = Math.round(potSize * (0.5 + rand * 0.5));
        const amount = Math.min(Math.max(betSize, this.state.blinds.bigBlind), player.chipStack);
        return { actionType: 'bet', amount };
      }
      if (rand < 0.3 && amountToCall < player.chipStack * 0.5) {
        const raiseAmount = amountToCall * 2.5 + player.currentBet;
        return { actionType: 'raise', amount: Math.min(raiseAmount, player.chipStack + player.currentBet) };
      }
      return { actionType: 'call' };
    }

    // Medium hand (one pair): check/call
    if (hand.rank === 1) {
      if (amountToCall === 0) {
        if (rand < 0.3) {
          const betSize = Math.round(potSize * 0.33);
          return { actionType: 'bet', amount: Math.min(Math.max(betSize, this.state.blinds.bigBlind), player.chipStack) };
        }
        return { actionType: 'check' };
      }
      if (amountToCall <= potSize * 0.5) {
        return { actionType: 'call' };
      }
      return rand < 0.2 ? { actionType: 'call' } : { actionType: 'fold' };
    }

    // Weak hand: check or fold
    if (amountToCall === 0) {
      return { actionType: 'check' };
    }

    // Occasional bluff
    if (rand < 0.08) {
      return { actionType: 'call' };
    }

    return { actionType: 'fold' };
  }

  private currentRoundBets(): number {
    return this.state.players.reduce((sum, p) => sum + p.currentBet, 0);
  }

  private getHumanHandStrength(): string | undefined {
    const human = this.state.players[this.state.humanPlayerIndex];
    if (!human.holeCards || this.state.communityCards.length === 0) return undefined;

    const hand = evaluateHand(human.holeCards, this.state.communityCards);
    return getHandDescription(hand);
  }

  private getHumanNetResult(): number {
    // This would require tracking initial stacks
    // Simplified: return 0 for now, will be computed by session layer
    return 0;
  }
}
