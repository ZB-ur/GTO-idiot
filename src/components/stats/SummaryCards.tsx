/**
 * SummaryCards — displays 4 key statistics in card layout:
 * total hands, total sessions, net P/L (BB), GTO conformance %.
 */

import React from 'react';
import type { StatsSummary } from '../../types/stats';

interface SummaryCardsProps {
  data: StatsSummary | null;
  loading: boolean;
}

interface CardDef {
  label: string;
  value: (d: StatsSummary) => string;
  color: (d: StatsSummary) => string;
  icon: string;
}

const cards: CardDef[] = [
  {
    label: 'Total Hands',
    value: (d) => d.totalHands.toLocaleString(),
    color: () => 'text-white',
    icon: '🃏',
  },
  {
    label: 'Sessions',
    value: (d) => d.totalSessions.toLocaleString(),
    color: () => 'text-white',
    icon: '📋',
  },
  {
    label: 'Net P/L (BB)',
    value: (d) => (d.netProfitLossBB >= 0 ? '+' : '') + d.netProfitLossBB.toFixed(1),
    color: (d) =>
      d.netProfitLossBB > 0
        ? 'text-emerald-400'
        : d.netProfitLossBB < 0
          ? 'text-red-400'
          : 'text-gray-300',
    icon: '💰',
  },
  {
    label: 'GTO Conformance',
    value: (d) => `${d.overallGTOConformance.toFixed(1)}%`,
    color: (d) =>
      d.overallGTOConformance >= 70
        ? 'text-emerald-400'
        : d.overallGTOConformance >= 50
          ? 'text-yellow-400'
          : 'text-red-400',
    icon: '🎯',
  },
];

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, loading }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{card.icon}</span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {card.label}
            </span>
          </div>
          {loading || !data ? (
            <div className="h-8 bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className={`text-2xl font-bold ${card.color(data)}`}>
              {card.value(data)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
