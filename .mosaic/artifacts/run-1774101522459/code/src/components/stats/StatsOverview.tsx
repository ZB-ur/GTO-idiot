// ============================================================
// StatsOverview — Grid of overview stat cards
// ============================================================

import React from 'react';
import type { StatsOverview as StatsOverviewData } from '../../types/stats';
import { StatCard } from './StatCard';
import { Skeleton } from '../common/Skeleton';

interface StatsOverviewProps {
  data: StatsOverviewData | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  data,
  loading,
}) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-2"
          >
            <Skeleton height="h-4" width="w-2/3" />
            <Skeleton height="h-8" width="w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const profitSentiment =
    data.cumulativeProfitLossBB > 0
      ? 'positive'
      : data.cumulativeProfitLossBB < 0
        ? 'negative'
        : ('neutral' as const);

  const formatBB = (val: number): string => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)} BB`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        label="Sessions"
        value={data.totalSessions}
        icon="🎰"
      />
      <StatCard
        label="Hands Played"
        value={data.totalHands}
        icon="🃏"
      />
      <StatCard
        label="Win Rate"
        value={`${data.winRate.toFixed(1)}%`}
        sentiment={data.winRate >= 50 ? 'positive' : 'negative'}
        icon="📊"
      />
      <StatCard
        label="Profit / Loss"
        value={formatBB(data.cumulativeProfitLossBB)}
        sentiment={profitSentiment}
        icon="💰"
      />
      <StatCard
        label="Total EV Loss"
        value={formatBB(data.cumulativeEvLossBB)}
        sentiment={data.cumulativeEvLossBB < -1 ? 'negative' : 'neutral'}
        icon="📉"
        subtext="vs GTO optimal"
      />
      <StatCard
        label="Avg EV Loss / Hand"
        value={formatBB(data.avgEvLossPerHandBB)}
        sentiment={data.avgEvLossPerHandBB < -0.5 ? 'negative' : 'neutral'}
        icon="🎯"
        subtext="lower is better"
      />
    </div>
  );
};
