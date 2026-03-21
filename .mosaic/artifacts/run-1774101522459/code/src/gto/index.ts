// ============================================================
// GTO module barrel export
// ============================================================

// Preflop ranges
export {
  getPreflopRange,
  isInRange,
  getRecommendedPreflopAction,
  getPlayableRange,
  getRangePercentage,
} from './preflop-ranges';

// Preflop range data utilities
export {
  lookupPreflopRange,
  lookupComboFrequency,
  holeCardsToCombo,
} from './preflop-range-data';

// Postflop heuristic engine
export {
  evaluatePostflop,
  type PostflopContext,
} from './postflop-heuristic';

// Monte Carlo simulation
export {
  runMonteCarloSimulation,
  type MonteCarloConfig,
  type MonteCarloInput,
} from './monte-carlo';

// Web Worker client
export {
  GTOClient,
  getGTOClient,
  disposeGTOClient,
} from './gto-client';

// Batch evaluator
export { batchEvaluateHand } from './batch-evaluator';
