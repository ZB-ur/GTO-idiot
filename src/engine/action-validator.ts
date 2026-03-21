// ============================================================
// GTO Idiot — Action Validator
// Validates player actions against current game state.
// ============================================================

import type {
  AvailableAction,
  HandState,
  PlayerActionRequest,
  PlayerState,
} from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Get all available actions for the current player.
 */
export function getAvailableActions(
  state: HandState,
  player: PlayerState,
  highestBet: number,
  bigBlind: number,
): AvailableAction[] {
  const actions: AvailableAction[] = [];
  const toCall = highestBet - player.current_bet;

  if (player.is_all_in || !player.is_active) {
    return [];
  }

  // Fold is always available when there's a bet to call
  if (toCall > 0) {
    actions.push({ type: 'fold', amount: null });
  }

  // Check — available when no bet to call
  if (toCall === 0) {
    actions.push({ type: 'check', amount: null });
  }

  // Call — available when there's a bet to call and player has chips
  if (toCall > 0) {
    const callAmount = Math.min(toCall, player.stack);
    actions.push({ type: 'call', amount: callAmount });
  }

  // Raise — available when player has enough chips
  const minRaise = computeMinRaise(state, player, highestBet, bigBlind);
  if (minRaise !== null && player.stack > toCall) {
    actions.push({ type: 'raise', amount: minRaise });
  }

  // All-in — always available if player has chips
  if (player.stack > 0) {
    actions.push({ type: 'all_in', amount: player.stack });
  }

  return actions;
}

/**
 * Compute min raise amount (total bet, not the raise increment).
 * Returns null if raise is not possible.
 */
export function computeMinRaise(
  state: HandState,
  player: PlayerState,
  highestBet: number,
  bigBlind: number,
): number | null {
  // Min raise = highest bet + last raise size (or big blind if no raise yet)
  const lastRaiseSize = getLastRaiseSize(state, bigBlind);
  const minRaiseTotal = highestBet + lastRaiseSize;
  const raiseNeeded = minRaiseTotal - player.current_bet;

  if (raiseNeeded >= player.stack) {
    return null; // Can only all-in, not a proper raise
  }

  return minRaiseTotal;
}

/**
 * Compute max raise amount (which is all-in).
 */
export function computeMaxRaise(
  player: PlayerState,
): number {
  return player.stack + player.current_bet;
}

/**
 * Get the last raise size from the action history in the current street.
 */
function getLastRaiseSize(state: HandState, bigBlind: number): number {
  // Look through players for the largest raise increment this street
  // In a simplified model, the last raise size is tracked by comparing bets
  // Default to big blind if no raises yet
  let maxBet = 0;
  let prevMaxBet = 0;

  for (const p of state.players) {
    if (p.current_bet > maxBet) {
      prevMaxBet = maxBet;
      maxBet = p.current_bet;
    }
  }

  const raiseSize = maxBet - prevMaxBet;
  return Math.max(raiseSize, bigBlind);
}

/**
 * Validate a player action against the current game state.
 */
export function validateAction(
  state: HandState,
  player: PlayerState,
  action: PlayerActionRequest,
  highestBet: number,
  bigBlind: number,
): ValidationResult {
  // Basic checks
  if (state.status !== 'in_progress') {
    return { valid: false, error: 'Hand is not in progress' };
  }

  if (state.current_player_seat !== player.seat) {
    return { valid: false, error: 'Not this player\'s turn' };
  }

  if (!player.is_active) {
    return { valid: false, error: 'Player has folded' };
  }

  if (player.is_all_in) {
    return { valid: false, error: 'Player is already all-in' };
  }

  const toCall = highestBet - player.current_bet;
  const availableActions = getAvailableActions(state, player, highestBet, bigBlind);
  const actionTypes = availableActions.map((a) => a.type);

  switch (action.action) {
    case 'fold':
      if (toCall === 0) {
        return { valid: false, error: 'Cannot fold when there is nothing to call (use check)' };
      }
      return { valid: true };

    case 'check':
      if (toCall > 0) {
        return { valid: false, error: `Must call ${toCall} or fold` };
      }
      return { valid: true };

    case 'call':
      if (toCall === 0) {
        return { valid: false, error: 'Nothing to call (use check)' };
      }
      return { valid: true };

    case 'raise': {
      if (!actionTypes.includes('raise')) {
        return { valid: false, error: 'Raise is not available' };
      }

      const amount = action.amount;
      if (amount == null) {
        return { valid: false, error: 'Raise amount is required' };
      }

      const minRaise = computeMinRaise(state, player, highestBet, bigBlind);
      const maxRaise = computeMaxRaise(player);

      if (minRaise !== null && amount < minRaise) {
        return { valid: false, error: `Raise must be at least ${minRaise}` };
      }

      if (amount > maxRaise) {
        return { valid: false, error: `Raise cannot exceed ${maxRaise} (all-in)` };
      }

      // If raise equals all-in, it's valid even if below min raise
      if (amount === maxRaise) {
        return { valid: true };
      }

      return { valid: true };
    }

    case 'all_in':
      if (player.stack <= 0) {
        return { valid: false, error: 'Player has no chips to go all-in' };
      }
      return { valid: true };

    default:
      return { valid: false, error: `Unknown action: ${action.action}` };
  }
}
