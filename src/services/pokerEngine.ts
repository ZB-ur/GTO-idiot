import type {
  HandState,
  ActionType,
  Street,
  GameSession,
  ActionResult,
  AdvanceResult,
  PlayerInfo,
  HandPlayerState,
  PotInfo,
  HandResult,
  WinnerInfo,
  Card,
  BettingRoundState,
} from '../types';
import { POSITIONS } from '../types';
import { createDeck, shuffle, deal } from './deck';
import { findBestFive, compareHands } from './handEvaluator';
import { calculatePots } from './potCalculator';
import { createBettingRound, processAction as processBettingAction } from './bettingRound';

const NUM_SEATS = 6;

function nextSeat(seat: number, offset: number = 1): number {
  return (seat + offset) % NUM_SEATS;
}

function buildPotInfo(players: HandPlayerState[]): PotInfo {
  const calc = calculatePots(players);
  return {
    mainPot: calc.mainPot,
    sidePots: calc.sidePots,
    totalPot: calc.totalPot,
  };
}

export class PokerEngine {
  private session: GameSession | null = null;
  private currentHand: HandState | null = null;
  private deckState = createDeck();
  private bettingState: BettingRoundState | null = null;
  private allHoleCards: Map<number, Card[]> = new Map();

  constructor(session: GameSession) {
    this.session = session;
  }

  dealNewHand(): HandState {
    if (!this.session) throw new Error('No active session');

    // Advance dealer
    const prevDealer = this.session.dealerSeatIndex;
    const newDealer = nextSeat(prevDealer);
    this.session.dealerSeatIndex = newDealer;
    this.session.handCount += 1;
    this.session.isHandInProgress = true;

    // Create and shuffle deck
    this.deckState = shuffle(createDeck());
    this.allHoleCards.clear();

    const sbSeat = nextSeat(newDealer);
    const bbSeat = nextSeat(newDealer, 2);
    const sb = this.session.blinds.smallBlind;
    const bb = this.session.blinds.bigBlind;

    // Assign positions based on dealer
    const positionOrder = [newDealer];
    for (let i = 1; i < NUM_SEATS; i++) {
      positionOrder.push(nextSeat(newDealer, i));
    }
    // BTN = dealer, SB = +1, BB = +2, UTG = +3, MP = +4, CO = +5
    const posLabels = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'] as const;

    // Initialize player hand states
    const players: HandPlayerState[] = this.session.players.map((p) => {
      const posIdx = positionOrder.indexOf(p.seatIndex);
      return {
        seatIndex: p.seatIndex,
        position: POSITIONS[POSITIONS.indexOf(posLabels[posIdx])],
        chipCount: p.chipCount,
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isSittingOut: p.isSittingOut,
      };
    });

    // Post blinds
    const sbPlayer = players.find(p => p.seatIndex === sbSeat)!;
    const sbAmount = Math.min(sb, sbPlayer.chipCount);
    sbPlayer.currentBet = sbAmount;
    sbPlayer.totalInvested = sbAmount;
    sbPlayer.chipCount -= sbAmount;
    sbPlayer.lastAction = 'post_sb';
    sbPlayer.lastActionAmount = sbAmount;
    if (sbPlayer.chipCount === 0) sbPlayer.isAllIn = true;

    const bbPlayer = players.find(p => p.seatIndex === bbSeat)!;
    const bbAmount = Math.min(bb, bbPlayer.chipCount);
    bbPlayer.currentBet = bbAmount;
    bbPlayer.totalInvested = bbAmount;
    bbPlayer.chipCount -= bbAmount;
    bbPlayer.lastAction = 'post_bb';
    bbPlayer.lastActionAmount = bbAmount;
    if (bbPlayer.chipCount === 0) bbPlayer.isAllIn = true;

    // Deal hole cards (2 to each active player, starting from SB)
    for (let i = 0; i < NUM_SEATS; i++) {
      const seat = nextSeat(newDealer, i + 1);
      const result = deal(this.deckState, 2);
      this.deckState = result.deck;
      const player = players.find(p => p.seatIndex === seat)!;
      player.holeCards = result.cards;
      this.allHoleCards.set(seat, result.cards);
    }

    // User's hole cards
    const userHoleCards = this.allHoleCards.get(this.session.userSeatIndex) ?? [];

    // Set up betting round (preflop, action starts UTG)
    this.bettingState = createBettingRound(players, newDealer, bb, true);

    const currentActorSeatIndex = this.bettingState.actorIndex;
    const isUserTurn = currentActorSeatIndex === this.session.userSeatIndex;

    this.currentHand = {
      handId: `hand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      handNumber: this.session.handCount,
      street: 'preflop',
      communityCards: [],
      userHoleCards,
      pot: buildPotInfo(players),
      players,
      currentActorSeatIndex,
      isUserTurn,
      dealerSeatIndex: newDealer,
      isComplete: false,
    };

    return { ...this.currentHand };
  }

  processAction(seatIndex: number, actionType: ActionType, amount?: number): ActionResult {
    if (!this.currentHand || !this.session || !this.bettingState) {
      throw new Error('No active hand');
    }

    const hand = this.currentHand;
    const player = hand.players.find(p => p.seatIndex === seatIndex);
    if (!player) throw new Error(`Player not found at seat ${seatIndex}`);

    // Apply action to player state
    const actionAmount = this.applyAction(player, actionType, amount ?? 0);

    // Update betting round state
    this.bettingState = processBettingAction(
      this.bettingState,
      hand.players,
      seatIndex,
      actionType,
      actionType === 'all_in' ? player.currentBet : (actionAmount),
      hand.dealerSeatIndex
    );

    // Update pot
    hand.pot = buildPotInfo(hand.players);

    // Check completion conditions
    const activePlayers = hand.players.filter(p => !p.hasFolded);
    const handComplete = activePlayers.length <= 1;
    const streetComplete = this.bettingState.isComplete || handComplete;

    // Update current actor
    if (handComplete) {
      hand.currentActorSeatIndex = -1;
      hand.isComplete = true;
      hand.result = this.resolveHand();
      this.session.isHandInProgress = false;
    } else if (streetComplete) {
      hand.currentActorSeatIndex = -1;
    } else {
      hand.currentActorSeatIndex = this.bettingState.actorIndex;
    }

    hand.isUserTurn = hand.currentActorSeatIndex === this.session.userSeatIndex;

    const result: ActionResult = {
      handState: { ...hand },
      actionRecorded: {
        seatIndex,
        actionType,
        amount: actionAmount,
        potAfter: hand.pot.totalPot,
        timestamp: new Date().toISOString(),
      },
      streetComplete,
      handComplete,
    };

    return result;
  }

  advanceStreet(): AdvanceResult {
    if (!this.currentHand || !this.session) {
      throw new Error('No active hand');
    }

    const hand = this.currentHand;
    const activePlayers = hand.players.filter(p => !p.hasFolded);

    // Reset current bets for new street
    for (const p of hand.players) {
      p.currentBet = 0;
      p.lastAction = undefined;
      p.lastActionAmount = undefined;
    }

    let newStreet: Street;
    let newCards: Card[] = [];
    let isShowdown = false;

    switch (hand.street) {
      case 'preflop': {
        // Deal flop (3 cards)
        const burnResult1 = deal(this.deckState, 1); // burn
        this.deckState = burnResult1.deck;
        const flopResult = deal(this.deckState, 3);
        this.deckState = flopResult.deck;
        newCards = flopResult.cards;
        hand.communityCards = [...hand.communityCards, ...newCards];
        newStreet = 'flop';
        break;
      }
      case 'flop': {
        const burnResult2 = deal(this.deckState, 1);
        this.deckState = burnResult2.deck;
        const turnResult = deal(this.deckState, 1);
        this.deckState = turnResult.deck;
        newCards = turnResult.cards;
        hand.communityCards = [...hand.communityCards, ...newCards];
        newStreet = 'turn';
        break;
      }
      case 'turn': {
        const burnResult3 = deal(this.deckState, 1);
        this.deckState = burnResult3.deck;
        const riverResult = deal(this.deckState, 1);
        this.deckState = riverResult.deck;
        newCards = riverResult.cards;
        hand.communityCards = [...hand.communityCards, ...newCards];
        newStreet = 'river';
        break;
      }
      case 'river': {
        newStreet = 'showdown';
        isShowdown = true;
        break;
      }
      default:
        throw new Error(`Cannot advance from street: ${hand.street}`);
    }

    hand.street = newStreet;

    if (isShowdown) {
      hand.isComplete = true;
      hand.result = this.resolveHand();
      hand.currentActorSeatIndex = -1;
      hand.isUserTurn = false;
      this.session.isHandInProgress = false;
    } else {
      // Check if we can actually have a betting round (need 2+ players who can act)
      const canAct = activePlayers.filter(p => !p.isAllIn);
      if (canAct.length < 2) {
        // Skip betting — all players are all-in or only one can act
        // Auto-advance will be needed
        hand.currentActorSeatIndex = -1;
        hand.isUserTurn = false;
        this.bettingState = createBettingRound(hand.players, hand.dealerSeatIndex, 0, false);
      } else {
        this.bettingState = createBettingRound(hand.players, hand.dealerSeatIndex, 0, false);
        hand.currentActorSeatIndex = this.bettingState.actorIndex;
        hand.isUserTurn = hand.currentActorSeatIndex === this.session.userSeatIndex;
      }
    }

    return {
      handState: { ...hand },
      newStreet,
      newCards,
      isShowdown,
    };
  }

  getHandState(): HandState | null {
    return this.currentHand ? { ...this.currentHand } : null;
  }

  /** Get all hole cards (for hand recording at end). */
  getAllHoleCards(): Map<number, Card[]> {
    return new Map(this.allHoleCards);
  }

  private applyAction(player: HandPlayerState, actionType: ActionType, amount: number): number {
    let actionAmount = 0;

    switch (actionType) {
      case 'fold':
        player.hasFolded = true;
        player.lastAction = 'fold';
        player.lastActionAmount = 0;
        break;

      case 'check':
        player.lastAction = 'check';
        player.lastActionAmount = 0;
        break;

      case 'call': {
        const toCall = Math.min(
          (this.bettingState?.currentBetToMatch ?? 0) - player.currentBet,
          player.chipCount
        );
        player.chipCount -= toCall;
        player.currentBet += toCall;
        player.totalInvested += toCall;
        player.lastAction = 'call';
        player.lastActionAmount = toCall;
        actionAmount = toCall;
        if (player.chipCount === 0) player.isAllIn = true;
        break;
      }

      case 'bet':
      case 'raise': {
        const totalBet = amount;
        const additional = totalBet - player.currentBet;
        const actualAdd = Math.min(additional, player.chipCount);
        player.chipCount -= actualAdd;
        player.currentBet += actualAdd;
        player.totalInvested += actualAdd;
        player.lastAction = actionType;
        player.lastActionAmount = player.currentBet;
        actionAmount = player.currentBet;
        if (player.chipCount === 0) player.isAllIn = true;
        break;
      }

      case 'all_in': {
        const allInAmount = player.chipCount;
        player.currentBet += allInAmount;
        player.totalInvested += allInAmount;
        player.chipCount = 0;
        player.isAllIn = true;
        player.lastAction = 'all_in';
        player.lastActionAmount = player.currentBet;
        actionAmount = player.currentBet;
        break;
      }

      case 'post_sb':
      case 'post_bb': {
        const blindAmount = Math.min(amount, player.chipCount);
        player.chipCount -= blindAmount;
        player.currentBet = blindAmount;
        player.totalInvested += blindAmount;
        player.lastAction = actionType;
        player.lastActionAmount = blindAmount;
        actionAmount = blindAmount;
        if (player.chipCount === 0) player.isAllIn = true;
        break;
      }
    }

    return actionAmount;
  }

  private resolveHand(): HandResult {
    const hand = this.currentHand!;
    const activePlayers = hand.players.filter(p => !p.hasFolded);

    // Collect all hole cards for recording
    const allPlayerHoleCards = hand.players.map(p => ({
      seatIndex: p.seatIndex,
      holeCards: this.allHoleCards.get(p.seatIndex) ?? [],
    }));

    // Won by fold — last player standing
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      const totalPot = hand.pot.totalPot;

      // Give pot to winner
      winner.chipCount += totalPot;

      // Update session player chips
      this.updateSessionChips(hand.players);

      const userPlayer = hand.players.find(p => p.seatIndex === this.session!.userSeatIndex)!;
      const userNet = userPlayer.chipCount - (this.session!.players.find(p => p.seatIndex === this.session!.userSeatIndex)?.chipCount ?? 0);

      return {
        winners: [{
          seatIndex: winner.seatIndex,
          amountWon: totalPot,
          handRank: 'Winner by fold',
          bestFiveCards: [],
          potType: 'main',
        }],
        userNetResult: userNet,
        wonByFold: true,
        showdownOccurred: false,
        allPlayerHoleCards,
      };
    }

    // Showdown — evaluate hands
    const evaluations = activePlayers.map(p => {
      const holeCards = this.allHoleCards.get(p.seatIndex) ?? [];
      const handRank = findBestFive(holeCards, hand.communityCards);
      return { seatIndex: p.seatIndex, handRank };
    });

    // Sort by hand value descending
    evaluations.sort((a, b) => compareHands(b.handRank, a.handRank));

    // Calculate pots and distribute
    const potCalc = calculatePots(hand.players);
    const winners: WinnerInfo[] = [];

    // Distribute main pot
    const mainEligible = evaluations.filter(e =>
      activePlayers.some(p => p.seatIndex === e.seatIndex)
    );
    if (mainEligible.length > 0) {
      const bestMainValue = mainEligible[0].handRank.value;
      const mainWinners = mainEligible.filter(e => e.handRank.value === bestMainValue);
      const mainShare = potCalc.mainPot / mainWinners.length;
      for (const w of mainWinners) {
        const player = hand.players.find(p => p.seatIndex === w.seatIndex)!;
        player.chipCount += mainShare;
        winners.push({
          seatIndex: w.seatIndex,
          amountWon: mainShare,
          handRank: w.handRank.description,
          bestFiveCards: w.handRank.bestFiveCards,
          potType: 'main',
        });
      }
    }

    // Distribute side pots
    for (const sp of potCalc.sidePots) {
      const eligible = evaluations.filter(e => sp.eligiblePlayers.includes(e.seatIndex));
      if (eligible.length === 0) continue;
      const bestValue = eligible[0].handRank.value;
      const spWinners = eligible.filter(e => e.handRank.value === bestValue);
      const share = sp.amount / spWinners.length;
      for (const w of spWinners) {
        const player = hand.players.find(p => p.seatIndex === w.seatIndex)!;
        player.chipCount += share;
        winners.push({
          seatIndex: w.seatIndex,
          amountWon: share,
          handRank: w.handRank.description,
          bestFiveCards: w.handRank.bestFiveCards,
          potType: 'side',
        });
      }
    }

    // Update session player chips
    this.updateSessionChips(hand.players);

    const userSeat = this.session!.userSeatIndex;
    const startChips = this.session!.players.find(p => p.seatIndex === userSeat)?.chipCount ?? 0;
    const endChips = hand.players.find(p => p.seatIndex === userSeat)?.chipCount ?? 0;

    return {
      winners,
      userNetResult: endChips - startChips,
      wonByFold: false,
      showdownOccurred: true,
      allPlayerHoleCards,
    };
  }

  private updateSessionChips(handPlayers: HandPlayerState[]): void {
    if (!this.session) return;
    for (const hp of handPlayers) {
      const sp = this.session.players.find(p => p.seatIndex === hp.seatIndex);
      if (sp) {
        sp.chipCount = hp.chipCount;
      }
    }
  }
}
