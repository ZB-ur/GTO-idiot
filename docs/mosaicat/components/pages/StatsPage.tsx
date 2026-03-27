import React, { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';
import { StatSummaryCard } from '../StatSummaryCard';
import { PLChart } from '../PLChart';
import { GTOComplianceRate } from '../GTOComplianceRate';
import { AvgEVLoss } from '../AvgEVLoss';
import { EmptyStatsState } from '../EmptyStatsState';
import { NoGTODataNotice } from '../NoGTODataNotice';
import { StatsLoadingSkeleton } from '../StatsLoadingSkeleton';

interface SessionStats {
  totalHands: number;
  totalSessions: number;
  winRate: number; // bb/100
  totalPL: number; // cents
  vpip: number; // 0-1
  pfr: number; // 0-1
  aggressionFactor: number;
  avgEVLoss: number; // bb
  gtoComplianceRate: number; // 0-1
}

interface PLDataPoint {
  hand: number;
  pl: number; // cumulative P&L in cents
}

interface StatsPageProps {
  className?: string;
}

type TimeRange = 'today' | 'week' | 'month' | 'all';

export const StatsPage: React.FC<StatsPageProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [plData, setPLData] = useState<PLDataPoint[]>([]);
  const [hasGTOData, setHasGTOData] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        // const res = await fetch(`/api/stats?range=${timeRange}`);
        // const data = await res.json();
        // setStats(data.summary);
        // setPLData(data.plHistory);
        // setHasGTOData(data.hasGTOData);

        // Simulated delay
        await new Promise((r) => setTimeout(r, 800));

        // Mock data for development
        setStats({
          totalHands: 2847,
          totalSessions: 23,
          winRate: 8.5,
          totalPL: 24250,
          vpip: 0.24,
          pfr: 0.19,
          aggressionFactor: 2.8,
          avgEVLoss: 1.2,
          gtoComplianceRate: 0.73,
        });
        setPLData(
          Array.from({ length: 50 }, (_, i) => ({
            hand: (i + 1) * 57,
            pl: Math.round(Math.sin(i * 0.3) * 5000 + i * 500 + Math.random() * 2000),
          }))
        );
        setHasGTOData(true);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'all', label: '全部' },
  ];

  if (loading) {
    return (
      <PageContainer className={className}>
        <StatsLoadingSkeleton />
      </PageContainer>
    );
  }

  if (!stats || stats.totalHands === 0) {
    return (
      <PageContainer className={className}>
        <EmptyStatsState />
      </PageContainer>
    );
  }

  return (
    <PageContainer className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-50">统计数据</h1>
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === opt.value
                  ? 'bg-amber-500 text-gray-950'
                  : 'text-gray-400 hover:text-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatSummaryCard
          label="总手数"
          value={stats.totalHands.toLocaleString()}
          icon="hands"
        />
        <StatSummaryCard
          label="盈亏"
          value={`${stats.totalPL >= 0 ? '+' : ''}${(stats.totalPL / 100).toFixed(2)}`}
          icon="dollar"
          trend={stats.totalPL >= 0 ? 'up' : 'down'}
        />
        <StatSummaryCard
          label="赢率"
          value={`${stats.winRate > 0 ? '+' : ''}${stats.winRate.toFixed(1)} bb/100`}
          icon="chart"
          trend={stats.winRate >= 0 ? 'up' : 'down'}
        />
        <StatSummaryCard
          label="场次"
          value={stats.totalSessions.toString()}
          icon="sessions"
        />
      </div>

      {/* P&L Chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-50 mb-4">盈亏走势</h2>
        <PLChart data={plData} />
      </div>

      {/* GTO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GTOComplianceRate rate={stats.gtoComplianceRate} />
        <AvgEVLoss value={stats.avgEVLoss} />
      </div>

      {/* Poker Stats */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold text-gray-50 mb-4">关键指标</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">
              {(stats.vpip * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">VPIP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">
              {(stats.pfr * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">PFR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">
              {stats.aggressionFactor.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400 mt-1">AF</div>
          </div>
        </div>
      </div>

      {/* No GTO Data Notice */}
      {!hasGTOData && <NoGTODataNotice className="mt-6" />}
    </PageContainer>
  );
};

export default StatsPage;