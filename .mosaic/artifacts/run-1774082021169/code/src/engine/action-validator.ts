/**
 * Action validator — validates player actions against current game state.
 * Pure functions with no side effects.
 */

import type { HandState, HandPlayerState, AvailableAction, AvailableActions, PlayerAction } from '../types/game';
import { calculateRaisePresets } from './pot-calculator';
import { roundTo } from './utils';

/** Validation result */
export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

/**
 * Get the list of available actions for the current actor.
 */
export function getAvailableActions(state: HandState, userId: string): AvailableActions {
  const currentPlayer = state.players.find(p => p.playerId === state.currentActorId);
  const userPlayer = state.players.find(p => p.playerId === userId);

  if (!currentPlayer || !userPlayer || currentPlayer.playerId !== userId) {
    return {
      handId: state.id,
      currentPot: state.pot,
      userStack: userPlayer?.stack ?? 0,
      actions: [],
    };
  }

  const actions = computeAvailableActions(state, currentPlayer);
  const amountToCall = getAmountToCall(state, currentPlayer);
  const effectiveStack = getEffectiveStack(state, currentPlayer);

  return {
    handId: state.id,
    currentPot: state.pot,
    userStack: currentPlayer.stack,
    effectiveStack,
    amountToCall,
    actions,
  };
}

/**
 * Validate a player action against the current game state.
 */
export function validateAction(state: HandState, playerId: string, action: PlayerAction): ValidationResult {
  // Check hand is in a playable phase
  if (state.phase === 'waiting' || state.phase === 'showdown' || state.phase === 'complete') {
    return { valid: false, error: 'Hand is not in a playable phase' };
  }

  // Check it's this player's turn
  if (state.currentActorId !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }

  const player = state.players.find(p => p.playerId === playerId);
  if (!player) {
    return { valid: false, error: 'Player not found' };
  }

  if (player.isFolded || player.isAllIn) {
    return { valid: false, error: 'Player cannot act (folded or all-in)' };
  }

  const available = computeAvailableActions(state, player);
  const matchingAction = available.find(a => a.type === action.action && a.isEnabled);

  if (!matchingAction) {
    return { valid: false, error: `Action '${action.action}' is not available` };
  }

  // Validate raise amount
  if (action.action === 'raise') {
    if (action.amount === undefined || action.amount === null) {
      return { valid: false, error: 'Raise amount is required' };
    }
    if (matchingAction.minAmount !== undefined && action.amount < matchingAction.minAmount) {
      // Allow if it's an all-in (player's remaining stack)
      if (action.amount !== player.stack + player.currentBet) {
        return { valid: false, error: `Raise must be at least ${matchingAction.minAmount}` };
      }
    }
    if (matchingAction.maxAmount !== undefined && action.amount > matchingAction.maxAmount) {
      return { valid: false, error: `Raise cannot exceed ${matchingAction.maxAmount}` };
    }
  }

  return { valid: true };
}

/**
 * Compute available actions for a player given current state.
 */
function computeAvailableActions(state: HandState, player: HandPlayerState): AvailableAction[] {
  const actions: AvailableAction[] = [];
  const highestBet = getHighestBet(state);
  const amountToCall = roundTo(highestBet - player.currentBet, 2);
  const canCheck = amountToCall <= 0;

  // Fold — always available unless can check
  actions.push({
    type: 'fold',
    isEnabled: !canCheck,
  });

  // Check — available when no bet to call
  actions.push({
    type: 'check',
    isEnabled: canCheck,
  });

  // Call — available when there's a bet to match
  if (!canCheck) {
    const callAmount = Math.min(amountToCall, player.stack);
    actions.push({
      type: 'call',
      isEnabled: true,
      amount: roundTo(callAmount, 2),
    });
  } else {
    actions.push({
      type: 'call',
      isEnabled: false,
    });
  }

  // Raise — available when player has enough chips
  const minRaise = getMinRaise(state, player);
  const maxRaise = roundTo(player.stack + player.currentBet, 2); // all-in amount

  if (player.stack > amountToCall && minRaise <= maxRaise) {
    const presets = calculateRaisePresets(state.pot + amountToCall, minRaise, maxRaise);
    actions.push({
      type: 'raise',
      isEnabled: true,
      minAmount: roundTo(minRaise, 2),
      maxAmount: roundTo(maxRaise, 2),
      presets,
    });
  } else {
    actions.push({
      type: 'raise',
      isEnabled: false,
    });
  }

  // All-in — always available if player has chips
  actions.push({
    type: 'all_in',
    isEnabled: player.stack > 0,
    amount: roundTo(player.stack, 2),
  });

  return actions;
}

/** Get the highest current bet on the table */
function getHighestBet(state: HandState): number {
  return Math.max(0, ...state.players.map(p => p.currentBet));
}

/** Get the amount a player needs to call */
function getAmountToCall(state: HandState, player: HandPlayerState): number {
  const highest = getHighestBet(state);
  return roundTo(Math.max(0, highest - player.currentBet), 2);
}

/**
 * Get minimum raise amount.
 * Min raise = previous bet/raise size + current highest bet.
 * Default min raise = 1 BB (big blind).
 */
function getMinRaise(state: HandState, player: HandPlayerState): number {
  const highestBet = getHighestBet(state);

  // Find the last raise size from action history for current street
  const currentStreetActions = state.actionHistory.filter(a => a.street === state.phase);
  let lastRaiseSize = 1; // default to 1 BB

  for (const action of currentStreetActions) {
    if (action.action === 'raise' && action.amount !== undefined) {
      // The raise size is the increase over the previous bet
      lastRaiseSize = Math.max(lastRaiseSize, action.amount - highestBet + (action.amount - highestBet));
    }
  }

  // Simplified: min raise = highest bet + last raise increment (at least 1 BB)
  // In practice, min raise = 2x the previous bet, or previous bet + raise increment
  const minRaise = highestBet + Math.max(1, lastRaiseSize);

  // Can't raise more than all-in
  return roundTo(Math.min(minRaise, player.stack + player.currentBet), 2);
}

/** Get effective stack (smallest stack among active, non-folded opponents) */
function getEffectiveStack(state: HandState, player: HandPlayerState): number {
  const opponents = state.players.filter(
    p => p.playerId !== player.playerId && !p.isFolded && p.isActive
  );

  if (opponents.length === 0) return player.stack;

  const minOpponentStack = Math.min(...opponents.map(p => p.stack));
  return Math.min(player.stack, minOpponentStack);
}
