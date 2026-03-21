// ============================================================
// GTO Service — GTO evaluation and preflop range API
// ============================================================

import type {
  Position,
  GTOEvaluationRequest,
  GTOEvaluationResult,
  GTOBatchRequest,
  GTOBatchResult,
  PreflopRange,
  PreflopScenario,
} from '../types';
import { getGTOClient, batchEvaluateHand, getPreflopRange as lookupPreflopRange } from '../gto';
import { handHistoryRepository } from '../persistence';
import { ServiceError } from './session-service';

/**
 * Get preflop GTO range for a given position and scenario.
 */
export function getPreflopRange(
  position: Position,
  scenario: PreflopScenario,
  _openerPosition?: Position,
): PreflopRange {
  return lookupPreflopRange(position, scenario);
}

/**
 * Evaluate a single decision point against GTO strategy.
 * Runs in Web Worker when available, falls back to heuristic.
 */
export async function evaluateDecision(
  request: GTOEvaluationRequest,
): Promise<GTOEvaluationResult> {
  const client = getGTOClient();
  return client.evaluate(request);
}

/**
 * Batch evaluate all user decision points in a completed hand.
 */
export async function batchEvaluateDecisions(
  request: GTOBatchRequest,
): Promise<GTOBatchResult> {
  const hand = await handHistoryRepository.getById(request.handId);
  if (!hand) {
    throw new ServiceError('HAND_NOT_FOUND', `No hand history found with ID ${request.handId}`);
  }

  return batchEvaluateHand(hand);
}
