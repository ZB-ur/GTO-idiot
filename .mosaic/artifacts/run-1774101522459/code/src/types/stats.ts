// ============================================================
// Statistics types — Aggregated analytics
// ============================================================

import type { Position, Street } from './game';

export interface StatsOverview {
  totalSessions: number;
  totalHands: number;
  winRate: number;
  cumulativeProfitLossBB: number;
  cumulativeEvLossBB: number;
  avgEvLossPerHandBB: number;
}

export interface PositionStats {
  position: Position;
  handCount: number;
  winRate: number;
  evLossBB: number;
  avgEvLossPerHandBB: number;
}

export interface StreetStats {
  street: Street;
  decisionCount: number;
  totalEvLossBB: number;
  avgEvLossPerDecisionBB: number;
}

export type ProfitTrendGroupBy = 'hand' | 'session';

export interface ProfitTrendDataPoint {
  index: number;
  label: string;
  cumulativeProfitBB: number;
  evLossBB: number;
}

export interface ProfitTrend {
  groupBy: ProfitTrendGroupBy;
  dataPoints: ProfitTrendDataPoint[];
}
