// Services layer — public API for UI components
// Re-exports all service modules

export { sessionService } from './session-service';
export { reviewService } from './review-service';
export { statsService } from './stats-service';
export { estimateEV, computeOverallConformance, computeConformancePercent } from './ev-estimator';
export type { EVEstimateInput, EVEstimateResult } from './ev-estimator';
