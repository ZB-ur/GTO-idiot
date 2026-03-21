// ============================================================
// Stats Service — Aggregated statistics API
// ============================================================

import type { StatsOverview, PositionStats, StreetStats, ProfitTrend, ProfitTrendGroupBy } from '../types';
import {
  getStatsOverview as aggregateOverview,
  getStatsByPosition as aggregateByPosition,
  getStatsByStreet as aggregateByStreet,
  getProfitTrend as aggregateProfitTrend,
} from '../stats/stats-aggregator';

export async function getStatsOverview(): Promise<StatsOverview> {
  return aggregateOverview();
}

export async function getStatsByPosition(): Promise<PositionStats[]> {
  return aggregateByPosition();
}

export async function getStatsByStreet(): Promise<StreetStats[]> {
  return aggregateByStreet();
}

export async function getProfitTrend(
  groupBy: ProfitTrendGroupBy = 'hand',
  limit = 200,
): Promise<ProfitTrend> {
  return aggregateProfitTrend(groupBy, limit);
}
