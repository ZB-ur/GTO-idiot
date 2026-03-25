import type { HandRecord, HandReplayResponse } from '../types';

export function generateReplaySteps(handRecord: HandRecord): HandReplayResponse {
  return {
    handId: handRecord.handId,
    totalSteps: 0,
    players: handRecord.players,
    steps: [],
    summary: {
      gtoConformance: handRecord.gtoConformance,
      totalUserDecisions: handRecord.userDecisionCount,
      gtoMatches: handRecord.gtoMatchCount,
      keyDeviations: [],
      netResult: handRecord.result?.userNetResult ?? 0,
    },
  };
}
