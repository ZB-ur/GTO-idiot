import React from 'react';

interface StatsGridProps {
  stats: {
    winRateBBPer100: number;
    showdownPct: number;
    foldPct: number;
    vpipPct: number;
    totalHands: number;
  };
}

const statCards = [
  { key: 'totalHands', label: 'Total Hands', format: (v: number) => v.toString(), icon: '#' },
  { key: 'winRateBBPer100', label: 'Win Rate', format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)} BB/100`, icon: 'W' },
  { key: 'vpipPct', label: 'VPIP', format: (v: number) => `${v.toFixed(1)}%`, icon: 'V' },
  { key: 'showdownPct', label: 'Showdown %', format: (v: number) => `${v.toFixed(1)}%`, icon: 'S' },
  { key: 'foldPct', label: 'Fold %', format: (v: number) => `${v.toFixed(1)}%`, icon: 'F' },
];

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const getValue = (key: string) => (stats as Record<string, number>)[key] ?? 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const value = getValue(card.key);
        return (
          <div key={card.key} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              {card.icon}
            </div>
            <div className="text-lg font-bold text-gray-900">{card.format(value)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;