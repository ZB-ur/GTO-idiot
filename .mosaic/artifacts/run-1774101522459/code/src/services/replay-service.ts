// ============================================================
// Replay Service — Hand replay with GTO analysis
// ============================================================

import type { HandReplayData } from '../types';
import { handHistoryRepository } from '../persistence';
import { batchEvaluateHand } from '../gto';
import { buildReplayData } from '../replay/replay-engine';
import { ServiceError } from './session-service';

/**
 * Get full replay data for a completed hand, including GTO analysis
 * at every user decision point.
 */
export async function getHandReplay(handId: string): Promise<HandReplayData> {
  const hand = await handHistoryRepository.getById(handId);
  if (!hand) {
    throw new ServiceError('HAND_NOT_FOUND', `No hand history found with ID ${handId}`);
  }

  // Run GTO batch evaluation on all user decision points
  const batchResult = await batchEvaluateHand(hand);

  // Build replay data with timeline markers
  return buildReplayData(hand, batchResult.decisionPoints);
}
