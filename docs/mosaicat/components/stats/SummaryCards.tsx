import React from 'react';

export interface StatsSummary {
  totalHands: number;
  totalSessions: number;
  netProfitLossBB: number;
  overallGTOConformance: number;
}

interface SummaryCardsProps {
  summary: StatsSummary;
}

interface CardConfig {
  label: string;
  getValue: (s: StatsSummary) => string;
  getColor: (s: StatsSummary) => string;
  icon: string;
}

const CARDS: CardConfig[] = [
  {
    label: '总手数',
    getValue: (s) => s.totalHands.toLocaleString(),
    getColor: () => 'text-gray-900',
    icon: '🃏',
  },
  {
    label: '盈亏 (BB)',
    getValue: (s) => {
      const val = s.netProfitLossBB;
      const sign = val >= 0 ? '+' : '';
      return `${sign}${val.toFixed(1)}`;
    },
    getColor: (s) =>
      s.netProfitLossBB >= 0 ? 'text-green-500' : 'text-red-500',
    icon: '💰',
  },
  {
    label: 'GTO 符合率',
    getValue: (s) => `${s.overallGTOConformance.toFixed(1)}%`,
    getColor: (s) =>
      s.overallGTOConformance >= 70
        ? 'text-green-500'
        : s.overallGTOConformance >= 50
          ? 'text-yellow-500'
          : 'text-red-500',
    icon: '🎯',
  },
  {
    label: '牌局数',
    getValue: (s) => s.totalSessions.toString(),
    getColor: () => 'text-gray-900',
    icon: '📊',
  },
];

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{card.icon}</span>
            <span className="text-sm font-medium text-gray-600">
              {card.label}
            </span>
          </div>
          <p className={`text-2xl font-bold ${card.getColor(summary)}`}>
            {card.getValue(summary)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;