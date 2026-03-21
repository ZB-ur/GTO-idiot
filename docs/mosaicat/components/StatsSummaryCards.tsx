import React from 'react';

interface StatsSummaryCardsProps {
  totalHands: number;
  winRate: number;
  netProfitBB: number;
  bbPer100?: number;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ label, value, subValue, trend = 'neutral', icon }: StatCardProps) {
  const trendColor =
    trend === 'positive'
      ? 'text-emerald-500'
      : trend === 'negative'
        ? 'text-red-500'
        : 'text-gray-400';

  return (
    <div className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-emerald-500">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-2xl font-bold ${trendColor}`}>{value}</span>
        {subValue && (
          <span className="text-xs text-gray-500">{subValue}</span>
        )}
      </div>
    </div>
  );
}

function formatProfit(bb: number): string {
  const sign = bb >= 0 ? '+' : '';
  return `${sign}${bb.toFixed(1)} BB`;
}

function formatBBPer100(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(2)} BB/100`;
}

const IconHands = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="3" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(8 14.5 8)" />
    <path d="M5 15v2M10 15v2M15 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconWinRate = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 5v5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconProfit = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14l4-4 3 3 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 5h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBBRate = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="10" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="8.5" y="7" width="3" height="9" rx="0.5" fill="currentColor" opacity="0.6" />
    <rect x="14" y="4" width="3" height="12" rx="0.5" fill="currentColor" />
  </svg>
);

export default function StatsSummaryCards({
  totalHands,
  winRate,
  netProfitBB,
  bbPer100,
}: StatsSummaryCardsProps) {
  const profitTrend: 'positive' | 'negative' | 'neutral' =
    netProfitBB > 0 ? 'positive' : netProfitBB < 0 ? 'negative' : 'neutral';

  const bbTrend: 'positive' | 'negative' | 'neutral' =
    bbPer100 !== undefined
      ? bbPer100 > 0
        ? 'positive'
        : bbPer100 < 0
          ? 'negative'
          : 'neutral'
      : 'neutral';

  return (
    <div className="flex flex-wrap gap-4">
      <StatCard
        label="总手数"
        value={totalHands.toLocaleString()}
        icon={<IconHands />}
      />
      <StatCard
        label="胜率"
        value={`${winRate.toFixed(1)}%`}
        trend={winRate >= 50 ? 'positive' : winRate < 45 ? 'negative' : 'neutral'}
        icon={<IconWinRate />}
      />
      <StatCard
        label="净盈亏"
        value={formatProfit(netProfitBB)}
        trend={profitTrend}
        icon={<IconProfit />}
      />
      {bbPer100 !== undefined && (
        <StatCard
          label="BB/100"
          value={formatBBPer100(bbPer100)}
          subValue="每100手盈亏率"
          trend={bbTrend}
          icon={<IconBBRate />}
        />
      )}
    </div>
  );
}