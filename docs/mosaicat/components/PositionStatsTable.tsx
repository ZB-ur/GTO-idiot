import React from 'react';

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface PositionStats {
  position: Position;
  handsPlayed: number;
  winRate: number;
  vpip: number;
  pfr: number;
}

interface PositionStatsTableProps {
  stats: PositionStats[];
  onPositionClick?: (position: Position) => void;
}

const formatStat = (value: number, suffix = ''): string => {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}${suffix}`;
};

const getWinRateColor = (winRate: number): string => {
  if (winRate > 5) return 'text-emerald-400';
  if (winRate > 0) return 'text-emerald-400/70';
  if (winRate === 0) return 'text-gray-400';
  return 'text-red-400';
};

export const PositionStatsTable: React.FC<PositionStatsTableProps> = ({
  stats,
  onPositionClick,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-50">Position Stats</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Position</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">Hands</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">Win Rate</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">VPIP</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">PFR</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr
                key={stat.position}
                className={`border-b border-gray-800 last:border-b-0 transition-colors ${
                  onPositionClick
                    ? 'hover:bg-gray-800 cursor-pointer'
                    : ''
                }`}
                onClick={() => onPositionClick?.(stat.position)}
              >
                <td className="px-6 py-3">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-lg bg-gray-800 text-sm font-semibold text-emerald-400">
                    {stat.position}
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-50">
                  {stat.handsPlayed}
                </td>
                <td className={`px-6 py-3 text-right text-sm font-medium ${getWinRateColor(stat.winRate)}`}>
                  {formatStat(stat.winRate, ' BB/100')}
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-50">
                  {formatStat(stat.vpip, '%')}
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-50">
                  {formatStat(stat.pfr, '%')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};