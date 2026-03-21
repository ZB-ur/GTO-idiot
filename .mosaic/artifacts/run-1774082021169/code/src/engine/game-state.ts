/**
 * Game state machine — manages hand lifecycle, dealing, betting rounds, and showdown.
 * All state transitions are immutable — returns new state objects.
 */

import type { Card } from '../types/card';
import type {
  HandState,
  ActionEntry,
  ActionType,
  HandPhase,
  Position,
  Street,
  WinnerInfo,
  SidePot,
  BlindSize,
  PlayerAction,
} from '../types/game';
import type { Deck } from './deck';
import { createDeck, shuffleDeck, dealCard, dealCards } from './deck';
import { evaluateHand, determineWinners } from './hand-evaluator';
import { calculateSidePots, distributePots, type PlayerContribution } from './pot-calculator';
import { generateId, getActionOrder, now, roundTo } from './utils';

/** Internal mutable hand state for engine processing */
interface MutableHandState {
  id: string;
  gameId: string;
  handNumber: number;
  phase: HandPhase;
  pot: number;
  sidePots: SidePot[];
  communityCards: Card[];
  players: MutablePlayerState[];
  dealerPosition: Position;
  currentActorId: string | null;
  isUserTurn: boolean;
  userHoleCards: { card1: Card; card2: Card } | undefined;
  actionHistory: ActionEntry[];
  winners: WinnerInfo[] | null;
  deck: Deck;
  /** Total contributed per player across all streets (for side pot calculation) */
  totalContributions: Map<string, number>;
}

interface MutablePlayerState {
  playerId: string;
  name: string;
  position: Position;
  stack: number;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
  lastAction?: ActionType;
  holeCards?: { card1: Card; card2: Card };
}

/**
 * Initialize a new hand — shuffle, deal hole cards, post blinds.
 */
export function initializeHand(
  gameId: string,
  handNumber: number,
  players: readonly { id: string; name: string; position: Position; stack: number; isUser: boolean }[],
  dealerPosition: Position,
  blindSize: BlindSize,
  userId: string,
): HandState {
  const deck = shuffleDeck(createDeck());
  const mutable = createMutableState(gameId, handNumber, players, dealerPosition, deck, userId);

  // Post blinds
  postBlinds(mutable, blindSize);

  // Deal hole cards
  dealHoleCards(mutable, userId);

  // Set first actor (UTG preflop)
  setNextActor(mutable, true);

  return freezeState(mutable);
}

/**
 * Apply a player action to the hand state, returning the new state.
 * This is the main state transition function.
 */
export function applyAction(
  state: HandState,
  playerId: string,
  action: PlayerAction,
  deck?: Deck,
): HandState {
  const mutable = thawState(state, deck);
  const player = mutable.players.find(p => p.playerId === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const actionEntry = processAction(mutable, player, action);
  mutable.actionHistory.push(actionEntry);

  // Check if betting round is complete
  if (isBettingRoundComplete(mutable)) {
    advancePhase(mutable);
  } else {
    setNextActor(mutable, mutable.phase === 'preflop');
  }

  return freezeState(mutable);
}

/**
 * Check if the hand is complete.
 */
export function isHandComplete(state: HandState): boolean {
  return state.phase === 'complete';
}

/**
 * Get the current street as a Street type (maps phases to streets).
 */
export function getCurrentStreet(phase: HandPhase): Street | null {
  switch (phase) {
    case 'preflop': return 'preflop';
    case 'flop': return 'flop';
    case 'turn': return 'turn';
    case 'river': return 'river';
    default: return null;
  }
}

/**
 * Check if only one player remains (everyone else folded).
 */
export function isLastPlayerStanding(state: HandState): boolean {
  const activePlayers = state.players.filter(p => !p.isFolded && p.isActive);
  return activePlayers.length <= 1;
}

// ─── Internal helpers ───────────────────────────────────────────────

function createMutableState(
  gameId: string,
  handNumber: number,
  players: readonly { id: string; name: string; position: Position; stack: number; isUser: boolean }[],
  dealerPosition: Position,
  deck: Deck,
  _userId: string,
): MutableHandState {
  return {
    id: generateId(),
    gameId,
    handNumber,
    phase: 'preflop',
    pot: 0,
    sidePots: [],
    communityCards: [],
    players: players.map(p => ({
      playerId: p.id,
      name: p.name,
      position: p.position,
      stack: p.stack,
      currentBet: 0,
      isFolded: false,
      isAllIn: false,
      isActive: true,
      holeCards: undefined,
    })),
    dealerPosition,
    currentActorId: null,
    isUserTurn: false,
    userHoleCards: undefined,
    actionHistory: [],
    winners: null,
    deck,
    totalContributions: new Map(players.map(p => [p.id, 0])),
  };
}

function postBlinds(state: MutableHandState, blindSize: BlindSize): void {
  const { smallBlind, bigBlind } = blindSize;
  const actionOrder = getActionOrder(state.dealerPosition, false); // SB is first in postflop order

  // SB is dealer + 1, BB is dealer + 2
  const sbPosition = actionOrder[0]; // SB
  const bbPosition = actionOrder[1]; // BB

  const sbPlayer = state.players.find(p => p.position === sbPosition);
  const bbPlayer = state.players.find(p => p.position === bbPosition);

  if (sbPlayer) {
    const sbAmount = Math.min(smallBlind, sbPlayer.stack);
    sbPlayer.stack = roundTo(sbPlayer.stack - sbAmount, 2);
    sbPlayer.currentBet = sbAmount;
    state.pot = roundTo(state.pot + sbAmount, 2);
    state.totalContributions.set(sbPlayer.playerId, sbAmount);

    if (sbPlayer.stack === 0) sbPlayer.isAllIn = true;

    state.actionHistory.push({
      playerId: sbPlayer.playerId,
      playerName: sbPlayer.name,
      position: sbPlayer.position,
      action: 'raise', // Blinds are posted as forced bets
      amount: sbAmount,
      street: 'preflop',
      potAfterAction: state.pot,
      timestamp: now(),
    });
  }

  if (bbPlayer) {
    const bbAmount = Math.min(bigBlind, bbPlayer.stack);
    bbPlayer.stack = roundTo(bbPlayer.stack - bbAmount, 2);
    bbPlayer.currentBet = bbAmount;
    state.pot = roundTo(state.pot + bbAmount, 2);
    state.totalContributions.set(bbPlayer.playerId, bbAmount);

    if (bbPlayer.stack === 0) bbPlayer.isAllIn = true;

    state.actionHistory.push({
      playerId: bbPlayer.playerId,
      playerName: bbPlayer.name,
      position: bbPlayer.position,
      action: 'raise', // Big blind as forced bet
      amount: bbAmount,
      street: 'preflop',
      potAfterAction: state.pot,
      timestamp: now(),
    });
  }
}

function dealHoleCards(state: MutableHandState, userId: string): void {
  for (const player of state.players) {
    if (player.isActive) {
      const card1 = dealCard(state.deck);
      const card2 = dealCard(state.deck);
      player.holeCards = { card1, card2 };

      if (player.playerId === userId) {
        state.userHoleCards = { card1, card2 };
      }
    }
  }
}

function processAction(state: MutableHandState, player: MutablePlayerState, action: PlayerAction): ActionEntry {
  const street = getCurrentStreet(state.phase) ?? 'preflop';

  switch (action.action) {
    case 'fold':
      player.isFolded = true;
      player.isActive = false;
      player.lastAction = 'fold';
      break;

    case 'check':
      player.lastAction = 'check';
      break;

    case 'call': {
      const highestBet = Math.max(...state.players.map(p => p.currentBet));
      const callAmount = roundTo(Math.min(highestBet - player.currentBet, player.stack), 2);
      player.stack = roundTo(player.stack - callAmount, 2);
      player.currentBet = roundTo(player.currentBet + callAmount, 2);
      state.pot = roundTo(state.pot + callAmount, 2);
      const prev = state.totalContributions.get(player.playerId) ?? 0;
      state.totalContributions.set(player.playerId, roundTo(prev + callAmount, 2));
      if (player.stack === 0) player.isAllIn = true;
      player.lastAction = 'call';
      break;
    }

    case 'raise': {
      const raiseTotal = action.amount ?? 0;
      const additional = roundTo(raiseTotal - player.currentBet, 2);
      const actualAdditional = roundTo(Math.min(additional, player.stack), 2);
      player.stack = roundTo(player.stack - actualAdditional, 2);
      player.currentBet = roundTo(player.currentBet + actualAdditional, 2);
      state.pot = roundTo(state.pot + actualAdditional, 2);
      const prev = state.totalContributions.get(player.playerId) ?? 0;
      state.totalContributions.set(player.playerId, roundTo(prev + actualAdditional, 2));
      if (player.stack === 0) player.isAllIn = true;
      player.lastAction = 'raise';
      break;
    }

    case 'all_in': {
      const allInAmount = player.stack;
      player.currentBet = roundTo(player.currentBet + allInAmount, 2);
      state.pot = roundTo(state.pot + allInAmount, 2);
      const prev = state.totalContributions.get(player.playerId) ?? 0;
      state.totalContributions.set(player.playerId, roundTo(prev + allInAmount, 2));
      player.stack = 0;
      player.isAllIn = true;
      player.lastAction = 'all_in';
      break;
    }
  }

  return {
    playerId: player.playerId,
    playerName: player.name,
    position: player.position,
    action: action.action,
    amount: action.amount ?? (action.action === 'all_in' ? player.currentBet : undefined),
    street,
    potAfterAction: state.pot,
    timestamp: now(),
  };
}

function isBettingRoundComplete(state: MutableHandState): boolean {
  const activePlayers = state.players.filter(p => !p.isFolded && p.isActive);

  // Only one player left — hand over
  if (activePlayers.length <= 1) return true;

  // All active, non-all-in players must have acted and matched the highest bet
  const canAct = activePlayers.filter(p => !p.isAllIn);
  if (canAct.length === 0) return true; // everyone is all-in

  const highestBet = Math.max(...activePlayers.map(p => p.currentBet));
  const currentStreet = getCurrentStreet(state.phase);
  const streetActions = state.actionHistory.filter(
    a => a.street === currentStreet && !['raise', 'raise'].includes('')
  );

  // Every player who can act must have bet equal to highest, and must have had a chance to act
  for (const player of canAct) {
    // Check player has acted this street (excluding blind posts in preflop)
    const playerActions = streetActions.filter(a => a.playerId === player.playerId);
    const voluntaryActions = state.phase === 'preflop'
      ? playerActions.slice(player.position === 'SB' || player.position === 'BB' ? 1 : 0)
      : playerActions;

    if (voluntaryActions.length === 0) return false;
    if (player.currentBet < highestBet) return false;
  }

  return true;
}

function advancePhase(state: MutableHandState): void {
  const activePlayers = state.players.filter(p => !p.isFolded && p.isActive);

  // Only one player remains — they win
  if (activePlayers.length <= 1) {
    resolveWinner(state);
    return;
  }

  // Reset current bets for new street
  for (const player of state.players) {
    player.currentBet = 0;
  }

  // All remaining players are all-in — run out community cards
  const canAct = activePlayers.filter(p => !p.isAllIn);

  switch (state.phase) {
    case 'preflop':
      state.phase = 'flop';
      dealCommunityCards(state, 3);
      break;
    case 'flop':
      state.phase = 'turn';
      dealCommunityCards(state, 1);
      break;
    case 'turn':
      state.phase = 'river';
      dealCommunityCards(state, 1);
      break;
    case 'river':
      state.phase = 'showdown';
      resolveShowdown(state);
      return;
  }

  // If no one can act (all all-in), continue advancing
  if (canAct.length <= 1) {
    advancePhase(state);
    return;
  }

  // Set next actor for new street (postflop order)
  setNextActor(state, false);
}

function dealCommunityCards(state: MutableHandState, count: number): void {
  // Burn a card before dealing community cards
  dealCard(state.deck);
  const cards = dealCards(state.deck, count);
  state.communityCards.push(...cards);
}

function setNextActor(state: MutableHandState, isPreflop: boolean): void {
  const order = getActionOrder(state.dealerPosition, isPreflop);

  // Find the next player who can act
  const currentIdx = state.currentActorId
    ? order.indexOf(state.players.find(p => p.playerId === state.currentActorId)?.position ?? order[0]!)
    : -1;

  for (let i = 1; i <= order.length; i++) {
    const pos = order[(currentIdx + i) % order.length];
    const player = state.players.find(p => p.position === pos);
    if (player && !player.isFolded && !player.isAllIn && player.isActive) {
      state.currentActorId = player.playerId;
      return;
    }
  }

  // No one can act
  state.currentActorId = null;
}

function resolveShowdown(state: MutableHandState): void {
  const activePlayers = state.players.filter(p => !p.isFolded && p.isActive);

  // Evaluate each player's hand
  const evaluations = activePlayers.map(p => {
    const allCards = [...(p.holeCards ? [p.holeCards.card1, p.holeCards.card2] : []), ...state.communityCards];
    const evaluation = evaluateHand(allCards);
    return { playerId: p.playerId, evaluation };
  });

  // Calculate side pots
  const contributions: PlayerContribution[] = state.players.map(p => ({
    playerId: p.playerId,
    totalBet: state.totalContributions.get(p.playerId) ?? 0,
    isAllIn: p.isAllIn,
    isFolded: p.isFolded,
  }));

  const pots = calculateSidePots(contributions);

  // Determine winners for each pot
  const winnersByPot = pots.map(pot => {
    const eligible = evaluations.filter(e => pot.eligiblePlayers.includes(e.playerId));
    return determineWinners(eligible);
  });

  const distributions = distributePots(pots, winnersByPot);

  // Build winner info
  state.winners = distributions.map(d => {
    const player = state.players.find(p => p.playerId === d.playerId)!;
    const evaluation = evaluations.find(e => e.playerId === d.playerId);
    return {
      playerId: d.playerId,
      playerName: player.name,
      amount: d.amount,
      handRank: evaluation?.evaluation.description,
      holeCards: player.holeCards,
    };
  });

  // Update stacks
  for (const dist of distributions) {
    const player = state.players.find(p => p.playerId === dist.playerId);
    if (player) {
      player.stack = roundTo(player.stack + dist.amount, 2);
    }
  }

  state.sidePots = pots;
  state.phase = 'complete';
  state.currentActorId = null;
}

function resolveWinner(state: MutableHandState): void {
  const winner = state.players.find(p => !p.isFolded && p.isActive);
  if (!winner) {
    state.phase = 'complete';
    state.currentActorId = null;
    return;
  }

  // Winner takes the pot
  winner.stack = roundTo(winner.stack + state.pot, 2);

  state.winners = [{
    playerId: winner.playerId,
    playerName: winner.name,
    amount: state.pot,
    holeCards: winner.holeCards,
  }];

  state.phase = 'complete';
  state.currentActorId = null;
}

function freezeState(state: MutableHandState): HandState {
  const userPlayer = state.players.find(p =>
    state.userHoleCards &&
    p.holeCards?.card1.notation === state.userHoleCards.card1.notation &&
    p.holeCards?.card2.notation === state.userHoleCards.card2.notation
  );

  return {
    id: state.id,
    gameId: state.gameId,
    handNumber: state.handNumber,
    phase: state.phase,
    pot: state.pot,
    sidePots: state.sidePots.length > 0 ? state.sidePots : undefined,
    communityCards: [...state.communityCards],
    players: state.players.map(p => ({
      playerId: p.playerId,
      name: p.name,
      position: p.position,
      stack: p.stack,
      currentBet: p.currentBet,
      isFolded: p.isFolded,
      isAllIn: p.isAllIn,
      isActive: !p.isFolded,
      lastAction: p.lastAction,
      // Only show hole cards at showdown
      holeCards: state.phase === 'complete' || state.phase === 'showdown'
        ? p.holeCards : undefined,
    })),
    dealerPosition: state.dealerPosition,
    currentActorId: state.currentActorId,
    isUserTurn: state.currentActorId === userPlayer?.playerId,
    userHoleCards: state.userHoleCards,
    actionHistory: [...state.actionHistory],
    winners: state.winners,
  };
}

function thawState(state: HandState, existingDeck?: Deck): MutableHandState {
  const deck = existingDeck ?? shuffleDeck(createDeck());

  // Reconstruct total contributions from action history
  const totalContributions = new Map<string, number>();
  for (const player of state.players) {
    totalContributions.set(player.playerId, 0);
  }
  for (const action of state.actionHistory) {
    if (action.amount && (action.action === 'call' || action.action === 'raise' || action.action === 'all_in')) {
      const prevAmount = totalContributions.get(action.playerId) ?? 0;
      // For raise, amount is total bet, we need the incremental
      // This is a simplification — for accurate tracking, use the mutable state
      totalContributions.set(action.playerId, prevAmount + action.amount);
    }
  }

  return {
    id: state.id,
    gameId: state.gameId,
    handNumber: state.handNumber ?? 0,
    phase: state.phase,
    pot: state.pot,
    sidePots: state.sidePots ? [...state.sidePots] : [],
    communityCards: [...state.communityCards],
    players: state.players.map(p => ({
      playerId: p.playerId,
      name: p.name,
      position: p.position,
      stack: p.stack,
      currentBet: p.currentBet,
      isFolded: p.isFolded,
      isAllIn: p.isAllIn,
      isActive: p.isActive,
      lastAction: p.lastAction,
      holeCards: p.holeCards ? { card1: p.holeCards.card1, card2: p.holeCards.card2 } : undefined,
    })),
    dealerPosition: state.dealerPosition,
    currentActorId: state.currentActorId,
    isUserTurn: state.isUserTurn,
    userHoleCards: state.userHoleCards ? {
      card1: state.userHoleCards.card1,
      card2: state.userHoleCards.card2,
    } : undefined,
    actionHistory: [...state.actionHistory],
    winners: state.winners ? [...state.winners] : null,
    deck,
    totalContributions,
  };
}
