import type { Statistics, PLDataPoint } from '../../types';

export async function computeStatistics(): Promise<Statistics> {
  return {
    totalHands: 0,
    netProfitBB: 0,
    winRate: 0,
    sessionCount: 0,
    handsWithReplay: 0,
    gtoMetrics: {
      complianceRate: 0,
      avgEvLossPerHand: 0,
      totalDecisions: 0,
      evaluatedHands: 0,
      isEstimated: true,
    },
  };
}

export async function computePLChartData(): Promise<{ dataPoints: PLDataPoint[] }> {
  return {
    dataPoints: [],
  };
}
