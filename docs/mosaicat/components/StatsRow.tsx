import React from 'react';

interface StatsRowProps {
  stats: {
    handsPlayed: number;
    netProfitLoss: number;
    bbPer100: number;
    vpipPercent: number;
    pfrPercent: number;
  };
  className?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
}

function StatCard({ label, value, valueColor = 'text-gray-50' }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col items-center gap-1 min-w-0 flex-1">
      <span className="text-gray-400 text-sm font-medium truncate w-full text-center">{label}</span>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

export function StatsRow({ stats, className = '' }: StatsRowProps) {
  const plColor = stats.netProfitLoss > 0
    ? 'text-emerald-400'
    : stats.netProfitLoss < 0
      ? 'text-red-400'
      : 'text-gray-50';

  const bbColor = stats.bbPer100 > 0
    ? 'text-emerald-400'
    : stats.bbPer100 < 0
      ? 'text-red-400'
      : 'text-gray-50';

  const plPrefix = stats.netProfitLoss > 0 ? '+' : '';
  const bbPrefix = stats.bbPer100 > 0 ? '+' : '';

  return (
    <div className={`flex gap-3 overflow-x-auto ${className}`}>
      <StatCard label="Hands" value={String(stats.handsPlayed)} />
      <StatCard label="P/L" value={`${plPrefix}${stats.netProfitLoss}`} valueColor={plColor} />
      <StatCard label="BB/100" value={`${bbPrefix}${stats.bbPer100.toFixed(1)}`} valueColor={bbColor} />
      <StatCard label="VPIP%" value={`${stats.vpipPercent.toFixed(1)}%`} valueColor="text-amber-400" />
      <StatCard label="PFR%" value={`${stats.pfrPercent.toFixed(1)}%`} valueColor="text-amber-400" />
    </div>
  );
}