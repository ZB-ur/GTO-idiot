import type { ActionType } from '../types';
import type { EngineGameState, ActionResult } from './types';
import { evaluateHand, compareHands } from './hand-evaluator';
import { calculatePots, distributePots } from './pot-calculator';
import { dealCards } from './deck';

/**
 * Find the next active player index (not folded, not all-in) starting after fromIndex.
 */
function nextActiveIndex(players: EngineGameState['players'], fromIndex: number): number {
  const n = players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (fromIndex + i) % n;
    if (!players[idx].isFolded && !players[idx].isAllIn) {
      return idx;
    }
  }
  return -1;
}

/**
 * Count players who have not folded.
 */
function activePlayers(players: EngineGameState['players']): number {
  return players.filter(p => !p.isFolded).length;
}

/**
 * Count players who can still act (not folded, not all-in).
 */
function actingPlayers(players: EngineGameState['players']): number {
  return players.filter(p => !p.isFolded && !p.isAllIn).length;
}

/**
 * Check if the betting round is complete:
 * - All active (non-folded, non-all-in) players have acted AND matched the highest bet
 * - Or only one non-folded player remains
 * - Or no active players can act (all are folded or all-in)
 */
function isBettingRoundComplete(state: EngineGameState, lastRaiserIndex: number | null, actedSet: Set<number>): boolean {
  if (activePlayers(state.players) <= 1) return true;
  if (actingPlayers(state.players) === 0) return true;

  const maxBet = Math.max(...state.players.map(p => p.currentBet));

  // All acting players must have acted and matched the highest bet
  for (let i = 0; i < state.players.length; i++) {
    const p = state.players[i];
    if (p.isFolded || p.isAllIn) continue;
    if (!actedSet.has(i)) return false;
    if (p.currentBet < maxBet) return false;
  }

  return true;
}

/**
 * Apply a single player action to the game state.
 * Returns updated state, and whether the street/hand is complete.
 */
export function applyAction(
  state: EngineGameState,
  playerId: string,
  actionType: ActionType,
  amount?: number,
): ActionResult {
  const newState: EngineGameState = {
    ...state,
    players: state.players.map(p => ({ ...p })),
    communityCards: [...state.communityCards],
    sidePots: state.sidePots.map(sp => ({ ...sp, eligiblePlayerIds: [...sp.eligiblePlayerIds] })),
    deck: { ...state.deck },
  };

  const playerIndex = newState.players.findIndex(p => p.playerId === playerId);
  if (playerIndex === -1) {
    throw new Error(`Player ${playerId} not found`);
  }

  const player = newState.players[playerIndex];

  if (player.isFolded || player.isAllIn) {
    throw new Error(`Player ${playerId} cannot act (folded: ${player.isFolded}, all-in: ${player.isAllIn})`);
  }

  const maxBet = Math.max(...newState.players.map(p => p.currentBet));
  const toCall = maxBet - player.currentBet;

  switch (actionType) {
    case 'fold': {
      player.isFolded = true;
      break;
    }

    case 'check': {
      if (toCall > 0) {
        throw new Error('Cannot check when facing a bet');
      }
      break;
    }

    case 'call': {
      const callAmount = Math.min(toCall, player.chipCount);
      player.chipCount -= callAmount;
      player.currentBet += callAmount;
      newState.pot += callAmount;
      if (player.chipCount === 0) {
        player.isAllIn = true;
      }
      break;
    }

    case 'raise':
    case 'bet': {
      const raiseTotal = amount ?? 0;
      if (raiseTotal <= 0) {
        throw new Error('Raise/bet amount must be positive');
      }
      // raiseTotal is the total bet the player wants to have
      const additionalChips = raiseTotal - player.currentBet;
      if (additionalChips <= 0) {
        throw new Error('Raise amount must be higher than current bet');
      }
      if (additionalChips > player.chipCount) {
        throw new Error('Insufficient chips for this raise');
      }
      player.chipCount -= additionalChips;
      player.currentBet = raiseTotal;
      newState.pot += additionalChips;
      if (player.chipCount === 0) {
        player.isAllIn = true;
      }
      break;
    }

    case 'all_in': {
      const allInAmount = player.chipCount;
      player.currentBet += allInAmount;
      newState.pot += allInAmount;
      player.chipCount = 0;
      player.isAllIn = true;
      break;
    }

    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }

  // Check if only one player remains
  if (activePlayers(newState.players) === 1) {
    return resolveHand(newState, false);
  }

  // Move to next active player
  const nextIdx = nextActiveIndex(newState.players, playerIndex);
  newState.currentPlayerIndex = nextIdx === -1 ? playerIndex : nextIdx;

  // Check if betting round is done (simplified: check all non-folded non-all-in players have equal bets)
  const isRoundDone = checkRoundComplete(newState, actionType, playerIndex);

  if (isRoundDone) {
    // Check if hand should go to showdown (all remaining players all-in, or only 1 can act)
    if (actingPlayers(newState.players) <= 1 && activePlayers(newState.players) > 1) {
      // Run out remaining streets
      return runOutBoard(newState);
    }

    return {
      newState,
      isStreetComplete: true,
      isHandComplete: false,
    };
  }

  return {
    newState,
    isStreetComplete: false,
    isHandComplete: false,
  };
}

/**
 * Simplified check if the betting round is complete.
 */
function checkRoundComplete(state: EngineGameState, lastAction: ActionType, actorIndex: number): boolean {
  if (activePlayers(state.players) <= 1) return true;
  if (actingPlayers(state.players) === 0) return true;

  const maxBet = Math.max(...state.players.map(p => p.currentBet));

  // All non-folded, non-all-in players must have equal bets
  for (const p of state.players) {
    if (p.isFolded || p.isAllIn) continue;
    if (p.currentBet < maxBet) return false;
  }

  // For preflop BB special case: if BB hasn't acted yet (still has option)
  // This is handled by the game loop tracking who has acted

  return true;
}

/**
 * Run out remaining community cards and resolve the hand (for all-in scenarios).
 */
function runOutBoard(state: EngineGameState): ActionResult {
  let newState = { ...state, deck: { ...state.deck }, communityCards: [...state.communityCards] };

  // Deal remaining community cards
  while (newState.communityCards.length < 5) {
    const count = newState.communityCards.length === 0 ? 3 : 1;
    const { cards, deck } = dealCards(newState.deck, count);
    newState = { ...newState, deck, communityCards: [...newState.communityCards, ...cards] };
  }

  // Update street
  newState.street = 'river';

  return resolveHand(newState, activePlayers(newState.players) > 1);
}

/**
 * Resolve the hand: determine winners and distribute pots.
 */
function resolveHand(state: EngineGameState, showdown: boolean): ActionResult {
  const newState = {
    ...state,
    players: state.players.map(p => ({ ...p })),
    isHandComplete: true,
  };

  // If only one player left, they win everything
  const nonFolded = newState.players.filter(p => !p.isFolded);

  if (nonFolded.length === 1) {
    const winner = nonFolded[0];
    const totalPot = newState.pot;
    winner.chipCount += totalPot;

    newState.result = {
      winners: [{
        playerId: winner.playerId,
        nickname: '',
        amount: totalPot,
        winningHand: null,
        holeCards: winner.holeCards,
      }],
      showdown: false,
    };
    newState.pot = 0;
    newState.sidePots = [];

    return { newState, isStreetComplete: true, isHandComplete: true };
  }

  // Showdown: evaluate hands
  const { mainPot, sidePots } = calculatePots(newState.players);
  const handRanks = new Map<string, number>();

  for (const p of nonFolded) {
    if (p.holeCards) {
      const rank = evaluateHand(p.holeCards, newState.communityCards);
      handRanks.set(p.playerId, rank.rank);
    }
  }

  const payouts = distributePots(mainPot, sidePots, handRanks);

  const winners = [...payouts.entries()].map(([playerId, amount]) => {
    const p = newState.players.find(pl => pl.playerId === playerId)!;
    const handRank = p.holeCards ? evaluateHand(p.holeCards, newState.communityCards) : null;
    return {
      playerId,
      nickname: '',
      amount,
      winningHand: handRank?.description ?? null,
      holeCards: p.holeCards,
    };
  });

  // Apply payouts to player chips
  for (const [playerId, amount] of payouts) {
    const p = newState.players.find(pl => pl.playerId === playerId)!;
    p.chipCount += amount;
  }

  newState.result = { winners, showdown };
  newState.pot = 0;
  newState.sidePots = [];

  // Reset bets
  for (const p of newState.players) {
    p.currentBet = 0;
  }

  return { newState, isStreetComplete: true, isHandComplete: true };
}

/**
 * Advance to the next street: deal community cards, reset bets, set action order.
 */
export function advanceStreet(state: EngineGameState): EngineGameState {
  const newState: EngineGameState = {
    ...state,
    players: state.players.map(p => ({ ...p, currentBet: 0 })),
    communityCards: [...state.communityCards],
    deck: { ...state.deck },
    sidePots: [...state.sidePots],
  };

  const streetOrder: Array<EngineGameState['street']> = ['preflop', 'flop', 'turn', 'river'];
  const currentIdx = streetOrder.indexOf(newState.street);

  if (currentIdx >= streetOrder.length - 1) {
    // Already on river — resolve hand
    const result = resolveHand(newState, true);
    return result.newState;
  }

  const nextStreet = streetOrder[currentIdx + 1];
  newState.street = nextStreet;

  // Deal community cards
  switch (nextStreet) {
    case 'flop': {
      const { cards, deck } = dealCards(newState.deck, 3);
      newState.communityCards = [...newState.communityCards, ...cards];
      newState.deck = deck;
      break;
    }
    case 'turn':
    case 'river': {
      const { cards, deck } = dealCards(newState.deck, 1);
      newState.communityCards = [...newState.communityCards, ...cards];
      newState.deck = deck;
      break;
    }
  }

  // Set action to first active player after dealer (post-flop: SB or next active)
  const n = newState.players.length;
  // Start from the player after the dealer (small blind position)
  let startIdx = -1;
  for (let i = 1; i <= n; i++) {
    const idx = (newState.dealerIndex + i) % n;
    if (!newState.players[idx].isFolded && !newState.players[idx].isAllIn) {
      startIdx = idx;
      break;
    }
  }

  newState.currentPlayerIndex = startIdx === -1 ? 0 : startIdx;

  return newState;
}
