import React from 'react';

export interface OverviewStats {
  totalHands: number;
  totalProfitLossBB: number;
  avgEvLossPerHand: number;
  handRange: string;
}

interface OverviewStatsCardsProps {
  stats: OverviewStats;
  isLoading?: boolean;
}

function formatProfitLoss(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} BB`;
}

function formatEvLoss(value: number): string {
  return `${value.toFixed(2)} BB`;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
  );
}

export default function OverviewStatsCards({ stats, isLoading }: OverviewStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const profitColor =
    stats.totalProfitLossBB > 0
      ? 'text-emerald-500'
      : stats.totalProfitLossBB < 0
        ? 'text-red-500'
        : 'text-gray-900';

  const evLossColor =
    stats.avgEvLossPerHand <= 0.5
      ? 'text-emerald-500'
      : stats.avgEvLossPerHand <= 1.5
        ? 'text-amber-500'
        : 'text-red-500';

  const cards = [
    {
      label: '总手数',
      value: stats.totalHands.toLocaleString(),
      valueColor: 'text-gray-900',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      subtitle: stats.handRange === 'all' ? '全部' : stats.handRange === 'last_100' ? '最近 100 手' : '最近 500 手',
    },
    {
      label: '总盈亏',
      value: formatProfitLoss(stats.totalProfitLossBB),
      valueColor: profitColor,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      subtitle: stats.totalProfitLossBB >= 0 ? '盈利中' : '亏损中',
    },
    {
      label: '平均 EV Loss',
      value: formatEvLoss(stats.avgEvLossPerHand),
      valueColor: evLossColor,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subtitle: stats.avgEvLossPerHand <= 0.5 ? '表现优秀' : stats.avgEvLossPerHand <= 1.5 ? '有提升空间' : '需要改进',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{card.label}</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.valueColor} mb-1`}>{card.value}</div>
          <div className="text-xs text-gray-400">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}