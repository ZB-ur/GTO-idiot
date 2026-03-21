// ============================================================
// StatsPage — Main statistics dashboard composing all stat views
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import type { StatsOverview as StatsOverviewData } from '../../types/stats';
import type { PositionStats } from '../../types/stats';
import type { StreetStats } from '../../types/stats';
import type { ProfitTrend, ProfitTrendGroupBy } from '../../types/stats';
import {
  getStatsOverview,
  getStatsByPosition,
  getStatsByStreet,
  getProfitTrend,
} from '../../stats/stats-aggregator';
import { StatsOverview } from './StatsOverview';
import { PositionStatsTable } from './PositionStatsTable';
import { StreetEVChart } from './StreetEVChart';
import { ProfitTrendChart } from './ProfitTrendChart';
import { EmptyState } from '../common/EmptyState';

export const StatsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<StatsOverviewData | null>(null);
  const [positionStats, setPositionStats] = useState<PositionStats[] | null>(
    null,
  );
  const [streetStats, setStreetStats] = useState<StreetStats[] | null>(null);
  const [profitTrend, setProfitTrend] = useState<ProfitTrend | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, posData, streetData, trendData] = await Promise.all([
        getStatsOverview(),
        getStatsByPosition(),
        getStatsByStreet(),
        getProfitTrend('hand', 200),
      ]);
      setOverview(overviewData);
      setPositionStats(posData);
      setStreetStats(streetData);
      setProfitTrend(trendData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleGroupByChange = useCallback(
    async (groupBy: ProfitTrendGroupBy) => {
      try {
        const trendData = await getProfitTrend(groupBy, 200);
        setProfitTrend(trendData);
      } catch (err) {
        console.error('Failed to load profit trend:', err);
      }
    },
    [],
  );

  // Show empty state when no data at all
  if (!loading && overview && overview.totalHands === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Statistics</h1>
        <EmptyState
          icon="📊"
          title="No Stats Yet"
          description="Play some hands to start tracking your performance. Your win rate, EV analysis, and profit trends will appear here."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
        <button
          onClick={loadStats}
          disabled={loading}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          title="Refresh stats"
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <StatsOverview data={overview} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitTrendChart
          data={profitTrend}
          loading={loading}
          onGroupByChange={handleGroupByChange}
        />
        <StreetEVChart data={streetStats} loading={loading} />
      </div>

      {/* Position Table */}
      <PositionStatsTable data={positionStats} loading={loading} />
    </div>
  );
};

export default StatsPage;
