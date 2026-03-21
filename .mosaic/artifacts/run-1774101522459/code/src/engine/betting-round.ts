// ============================================================
// BettingRound — Manages a single street's betting action
// ============================================================

import type { HandPlayer, LegalAction, PlayerAction, Street } from '../types';

export interface BettingState {
  /** Current bet level players must match to stay in (BB) */
  currentBet: number;
  /** Minimum raise increment (BB) */
  minRaiseIncrement: number;
  /** Last raiser seat (for action-closes tracking) */
  lastRaiserSeat: number | null;
  /** Number of active (non-folded, non-all-in) players */
  activeBettors: number;
  /** Set of seats that have acted this round */
  actedSeats: Set<number>;
  /** The current street */
  street: Street;
  /** Big blind amount */
  bigBlind: number;
}

/**
 * Determine the legal actions for a given player in the current betting state.
 */
export function getLegalActions(
  player: HandPlayer,
  state: BettingState
): LegalAction[] {
  const actions: LegalAction[] = [];

  if (!player.isActive || player.isAllIn) {
    return actions;
  }

  const toCall = state.currentBet - player.currentBet;
  const playerStack = player.stackBB;

  // Fold is always available if there's a bet to call
  if (toCall > 0) {
    actions.push({ type: 'fold' });
  }

  // Check — available if no bet to call
  if (toCall === 0) {
    actions.push({ type: 'check' });
  }

  // Call — available if there's a bet to call and player has chips
  if (toCall > 0 && playerStack > 0) {
    const callAmount = Math.min(toCall, playerStack);
    if (callAmount < playerStack) {
      actions.push({ type: 'call', callAmount });
    }
    // If calling would use entire stack, it's an all-in call
    if (callAmount >= playerStack) {
      actions.push({ type: 'all_in', minAmount: playerStack, maxAmount: playerStack });
    }
  }

  // Bet — available if no current bet and player has chips
  if (toCall === 0 && playerStack > 0) {
    const minBet = state.bigBlind;
    if (playerStack <= minBet) {
      // Can only go all-in
      actions.push({ type: 'all_in', minAmount: playerStack, maxAmount: playerStack });
    } else {
      actions.push({ type: 'bet', minAmount: minBet, maxAmount: playerStack });
    }
  }

  // Raise — available if there's a current bet and player has enough chips
  if (toCall > 0 && playerStack > toCall) {
    const minRaise = state.currentBet + state.minRaiseIncrement;
    const minRaiseAmount = minRaise - player.currentBet; // total to put in
    const maxRaiseAmount = playerStack;

    if (maxRaiseAmount <= minRaiseAmount) {
      // Can only all-in raise
      actions.push({ type: 'all_in', minAmount: playerStack, maxAmount: playerStack });
    } else {
      actions.push({
        type: 'raise',
        minAmount: minRaise, // total bet level
        maxAmount: player.currentBet + playerStack, // max total bet level
      });
    }
  }

  return actions;
}

/**
 * Validate and apply a player action, returning the chip amount deducted.
 * Returns the effective amount the player puts into the pot this action.
 */
export function applyAction(
  player: HandPlayer,
  action: PlayerAction,
  state: BettingState
): { chipsPut: number; newBetLevel: number } {
  const toCall = state.currentBet - player.currentBet;

  switch (action.type) {
    case 'fold': {
      player.isActive = false;
      player.lastAction = 'fold';
      return { chipsPut: 0, newBetLevel: state.currentBet };
    }

    case 'check': {
      if (toCall > 0) {
        throw new Error('Cannot check when there is a bet to call');
      }
      player.lastAction = 'check';
      return { chipsPut: 0, newBetLevel: state.currentBet };
    }

    case 'call': {
      if (toCall <= 0) {
        throw new Error('Nothing to call');
      }
      const callAmount = Math.min(toCall, player.stackBB);
      player.stackBB -= callAmount;
      player.currentBet += callAmount;
      player.lastAction = 'call';
      if (player.stackBB === 0) {
        player.isAllIn = true;
      }
      return { chipsPut: callAmount, newBetLevel: state.currentBet };
    }

    case 'bet': {
      if (state.currentBet > 0) {
        throw new Error('Cannot bet when there is already a bet — use raise');
      }
      const betAmount = action.amount ?? state.bigBlind;
      if (betAmount > player.stackBB) {
        throw new Error(`Bet amount ${betAmount} exceeds stack ${player.stackBB}`);
      }
      if (betAmount < state.bigBlind && betAmount < player.stackBB) {
        throw new Error(`Bet must be at least 1 BB (${state.bigBlind})`);
      }
      player.stackBB -= betAmount;
      player.currentBet += betAmount;
      player.lastAction = 'bet';
      if (player.stackBB === 0) {
        player.isAllIn = true;
      }
      return { chipsPut: betAmount, newBetLevel: player.currentBet };
    }

    case 'raise': {
      if (state.currentBet <= 0 && state.street !== 'preflop') {
        throw new Error('Cannot raise when there is no bet — use bet');
      }
      const raiseToLevel = action.amount ?? (state.currentBet + state.minRaiseIncrement);
      const totalToPut = raiseToLevel - player.currentBet;

      if (totalToPut > player.stackBB) {
        throw new Error(`Raise requires ${totalToPut} but stack is ${player.stackBB}`);
      }

      const raiseIncrement = raiseToLevel - state.currentBet;
      if (raiseIncrement < state.minRaiseIncrement && totalToPut < player.stackBB) {
        throw new Error(`Minimum raise is ${state.minRaiseIncrement}`);
      }

      player.stackBB -= totalToPut;
      player.currentBet = raiseToLevel;
      player.lastAction = 'raise';
      if (player.stackBB === 0) {
        player.isAllIn = true;
      }

      return {
        chipsPut: totalToPut,
        newBetLevel: raiseToLevel,
      };
    }

    case 'all_in': {
      const allInAmount = player.stackBB;
      const newLevel = player.currentBet + allInAmount;
      player.currentBet = newLevel;
      player.stackBB = 0;
      player.isAllIn = true;
      player.lastAction = 'all_in';

      return {
        chipsPut: allInAmount,
        newBetLevel: Math.max(state.currentBet, newLevel),
      };
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Determine if the betting round is complete.
 * A round is complete when all active (non-folded, non-all-in) players have
 * acted and matched the current bet level.
 */
export function isBettingRoundComplete(
  players: HandPlayer[],
  state: BettingState
): boolean {
  const activeBettors = players.filter(
    (p) => p.isActive && !p.isAllIn
  );

  // If 0 or 1 active bettors remain, round is complete
  if (activeBettors.length <= 1) {
    return true;
  }

  // All active bettors must have acted and matched the current bet
  for (const p of activeBettors) {
    if (!state.actedSeats.has(p.seat)) {
      return false;
    }
    if (p.currentBet < state.currentBet) {
      return false;
    }
  }

  return true;
}

/**
 * Reset per-round betting state for a new street.
 */
export function resetForNewStreet(
  players: HandPlayer[],
  street: Street,
  bigBlind: number
): BettingState {
  // Reset current bets for all players
  for (const p of players) {
    p.currentBet = 0;
    p.lastAction = null;
  }

  return {
    currentBet: 0,
    minRaiseIncrement: bigBlind,
    lastRaiserSeat: null,
    activeBettors: players.filter((p) => p.isActive && !p.isAllIn).length,
    actedSeats: new Set(),
    street,
    bigBlind,
  };
}
