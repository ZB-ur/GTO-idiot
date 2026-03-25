import type {
  StatisticsDashboard,
  TrendDataResponse,
  ErrorCategoriesResponse,
  ErrorTypeDetail,
} from '../types';

export function getStatistics(): StatisticsDashboard {
  return {
    totalHands: 0,
    totalPnl: 0,
    overallWinRate: 0,
    gtoConformance: 0,
    hasEnoughData: false,
    minimumHandsForTrend: 10,
  };
}

export function getTrends(groupBy: 'per_10_hands' | 'per_session'): TrendDataResponse {
  return {
    groupBy,
    dataPoints: [],
  };
}

export function getErrorCategories(): ErrorCategoriesResponse {
  return {
    totalErrors: 0,
    categories: [],
  };
}

export function getErrorDetail(errorType: string): ErrorTypeDetail | null {
  void errorType;
  return null;
}
