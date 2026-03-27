import type { Statistics, PLDataPoint } from '../../../types';

export async function computeStatistics(_sessionId?: string): Promise<Statistics> {
  return {
    totalHands: 0,
    netProfitBB: 0,
    winRate: 0,
    gtoMetrics: {
      complianceRate: 0,
      avgEvLossPerHand: 0,
      totalDecisions: 0,
      evaluatedHands: 0,
      isEstimated: true,
    },
    sessionCount: 0,
    handsWithReplay: 0,
  };
}

export async function computePLChartData(_sessionId?: string): Promise<PLDataPoint[]> {
  return [];
}
