// ============================================================
// PositionStatsTable — Win rate & EV loss by table position
// ============================================================

import React from 'react';
import type { PositionStats } from '../../types/stats';
import { SkeletonTable } from '../common/Skeleton';

interface PositionStatsTableProps {
  data: PositionStats[] | null;
  loading: boolean;
}

export const PositionStatsTable: React.FC<PositionStatsTableProps> = ({
  data,
  loading,
}) => {
  if (loading || !data) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Stats by Position
        </h3>
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  const hasData = data.some((p) => p.handCount > 0);

  if (!hasData) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Stats by Position
        </h3>
        <p className="text-gray-500 text-sm">
          No position data yet. Play some hands to see stats by position.
        </p>
      </div>
    );
  }

  const formatBB = (val: number): string => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
  };

  const getWinRateColor = (rate: number): string => {
    if (rate >= 60) return 'text-green-400';
    if (rate >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEvLossColor = (evLoss: number): string => {
    if (evLoss >= -0.5) return 'text-green-400';
    if (evLoss >= -2) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Position display order with visual hierarchy
  const positionLabels: Record<string, string> = {
    BTN: 'Button',
    SB: 'Small Blind',
    BB: 'Big Blind',
    UTG: 'Under the Gun',
    MP: 'Middle Position',
    CO: 'Cut Off',
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        Stats by Position
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2 pr-4 font-medium">Position</th>
              <th className="text-right py-2 px-4 font-medium">Hands</th>
              <th className="text-right py-2 px-4 font-medium">Win Rate</th>
              <th className="text-right py-2 px-4 font-medium">
                Total EV Loss
              </th>
              <th className="text-right py-2 pl-4 font-medium">
                Avg EV / Hand
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((pos) => (
              <tr
                key={pos.position}
                className="border-b border-gray-700/50 hover:bg-gray-750"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-10 text-center text-xs font-bold bg-gray-700 text-gray-200 rounded px-1.5 py-0.5">
                      {pos.position}
                    </span>
                    <span className="text-gray-400 text-xs hidden sm:inline">
                      {positionLabels[pos.position]}
                    </span>
                  </div>
                </td>
                <td className="text-right py-3 px-4 text-gray-300">
                  {pos.handCount}
                </td>
                <td
                  className={`text-right py-3 px-4 font-medium ${getWinRateColor(pos.winRate)}`}
                >
                  {pos.handCount > 0 ? `${pos.winRate.toFixed(1)}%` : '-'}
                </td>
                <td
                  className={`text-right py-3 px-4 ${getEvLossColor(pos.evLossBB)}`}
                >
                  {pos.handCount > 0 ? `${formatBB(pos.evLossBB)} BB` : '-'}
                </td>
                <td
                  className={`text-right py-3 pl-4 ${getEvLossColor(pos.avgEvLossPerHandBB)}`}
                >
                  {pos.handCount > 0
                    ? `${formatBB(pos.avgEvLossPerHandBB)} BB`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
