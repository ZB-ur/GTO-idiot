import React from 'react';

interface StatsOverviewProps {
  totalSessions: number;
  totalHands: number;
  winRate: number;
  cumulativeProfitLossBB: number;
  cumulativeEvLossBB: number;
  avgEvLossPerHandBB: number;
  className?: string;
}

interface StatCardData {
  label: string;
  value: string;
  subtext?: string;
  color: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalSessions,
  totalHands,
  winRate,
  cumulativeProfitLossBB,
  cumulativeEvLossBB,
  avgEvLossPerHandBB,
  className = '',
}) => {
  const plColor = cumulativeProfitLossBB >= 0 ? 'text-emerald-600' : 'text-red-500';
  const plSign = cumulativeProfitLossBB >= 0 ? '+' : '';

  const cards: StatCardData[] = [
    {
      label: 'Total Hands',
      value: totalHands.toLocaleString(),
      subtext: `${totalSessions} sessions`,
      color: 'text-gray-900',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      color: winRate >= 45 ? 'text-emerald-600' : winRate >= 35 ? 'text-amber-600' : 'text-red-500',
    },
    {
      label: 'Profit / Loss',
      value: `${plSign}${cumulativeProfitLossBB.toFixed(1)} BB`,
      color: plColor,
    },
    {
      label: 'Total EV Loss',
      value: `${cumulativeEvLossBB.toFixed(1)} BB`,
      color: cumulativeEvLossBB >= -20 ? 'text-emerald-600' : 'text-red-500',
    },
    {
      label: 'Avg EV Loss / Hand',
      value: `${avgEvLossPerHandBB.toFixed(2)} BB`,
      color: avgEvLossPerHandBB >= -0.5 ? 'text-emerald-600' : avgEvLossPerHandBB >= -1 ? 'text-amber-600' : 'text-red-500',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-1"
        >
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</span>
          <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
          {card.subtext && (
            <span className="text-xs text-gray-400">{card.subtext}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;