// ============================================================
// Engine barrel export
// ============================================================

export { DeckManager } from './deck-manager';
export { HandStateMachine, type HandConfig } from './hand-state-machine';
export {
  type BettingState,
  getLegalActions,
  applyAction,
  isBettingRoundComplete,
  resetForNewStreet,
} from './betting-round';
export { PotManager, type PlayerContribution } from './pot-manager';
export {
  evaluateHand,
  compareHands,
  estimateHandStrength,
  HandRankCategory,
  HAND_RANK_NAMES,
  type EvaluatedHand,
} from './hand-evaluator';
export { settleAtShowdown, settleWithoutShowdown, type SettlementInput } from './settlement';
export { GameEngine } from './game-engine';
