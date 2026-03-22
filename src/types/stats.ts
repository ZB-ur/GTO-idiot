import type { Position } from './poker';

export interface StatsSummary {
  totalHands: number;
  totalSessions: number;
  netProfitLossBB: number;
  overallGTOConformance: number;
}

export interface ConformanceTrendPoint {
  sessionId: string;
  date: string;
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

export interface ConformanceTrend {
  dataPoints: ConformanceTrendPoint[];
}

export interface PositionBreakdownEntry {
  position: Position;
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

export interface PositionBreakdown {
  positions: PositionBreakdownEntry[];
}

export interface StreetBreakdownEntry {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  conformance: number;
  decisionCount: number;
}

export interface StreetBreakdown {
  streets: StreetBreakdownEntry[];
}

export interface DeviationEntry {
  type: string;
  description: string;
  count: number;
  averageEvLoss: number;
  street?: 'preflop' | 'flop' | 'turn' | 'river';
  examples?: Array<{
    handId: string;
    sessionId: string;
  }>;
}

export interface TopDeviations {
  deviations: DeviationEntry[];
}

export interface StatsQueryParams {
  dateFrom?: string;
  dateTo?: string;
  sessionIds?: string[];
}
