import type { AvailableActions } from '../types';
import type { EngineGameState } from './types';

/**
 * Determine what actions are available for a given player in the current game state.
 */
export function getAvailableActions(state: EngineGameState, playerId: string): AvailableActions {
  const player = state.players.find(p => p.playerId === playerId);

  if (!player || player.isFolded || player.isAllIn || state.isHandComplete) {
    return {
      canFold: false,
      canCheck: false,
      canCall: false,
      canRaise: false,
    };
  }

  // Find the highest current bet in this round
  const maxBet = Math.max(...state.players.map(p => p.currentBet));
  const toCall = maxBet - player.currentBet;
  const bigBlind = 2; // Standard big blind for this game

  // Can always fold (except when no bet to face, but folding is still technically allowed)
  const canFold = toCall > 0;

  // Can check if no bet to face
  const canCheck = toCall === 0;

  // Can call if there's a bet to face and player has chips
  const canCall = toCall > 0 && player.chipCount > 0;
  const callAmount = canCall ? Math.min(toCall, player.chipCount) : undefined;

  // Can raise if player has enough chips to raise above current max bet
  // Min raise = previous raise size or big blind, whichever is larger
  const minRaiseIncrement = Math.max(bigBlind, toCall > 0 ? toCall : bigBlind);
  const minRaiseTotal = maxBet + minRaiseIncrement;
  const playerMaxBet = player.currentBet + player.chipCount;
  const canRaise = playerMaxBet > maxBet && player.chipCount > toCall;

  return {
    canFold,
    canCheck,
    canCall,
    callAmount,
    canRaise,
    minRaise: canRaise ? Math.min(minRaiseTotal, playerMaxBet) : undefined,
    maxRaise: canRaise ? playerMaxBet : undefined,
  };
}
