import React from 'react';

interface PositionStat {
  position: string;
  handCount: number;
  winRate: number;
  evLossBB: number;
  avgEvLossPerHandBB: number;
}

interface PositionStatsTableProps {
  positions: PositionStat[];
  onPositionClick?: (position: string) => void;
  className?: string;
}

function getWinRateColor(rate: number): string {
  if (rate >= 50) return 'text-emerald-600';
  if (rate >= 35) return 'text-amber-600';
  return 'text-red-500';
}

function getEvLossColor(loss: number): string {
  if (loss >= -0.5) return 'text-emerald-600';
  if (loss >= -2) return 'text-amber-600';
  return 'text-red-500';
}

export const PositionStatsTable: React.FC<PositionStatsTableProps> = ({
  positions,
  onPositionClick,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Performance by Position</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hands</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Win Rate</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total EV Loss</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg EV/Hand</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr
              key={pos.position}
              onClick={() => onPositionClick?.(pos.position)}
              className={`border-b border-gray-50 last:border-0 ${onPositionClick ? 'hover:bg-blue-50 cursor-pointer' : ''} transition-colors`}
            >
              <td className="px-6 py-3">
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700">
                  {pos.position}
                </span>
              </td>
              <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{pos.handCount}</td>
              <td className={`px-6 py-3 text-right text-sm font-bold ${getWinRateColor(pos.winRate)}`}>
                {pos.winRate.toFixed(1)}%
              </td>
              <td className={`px-6 py-3 text-right text-sm font-bold ${getEvLossColor(pos.evLossBB)}`}>
                {pos.evLossBB.toFixed(1)} BB
              </td>
              <td className={`px-6 py-3 text-right text-sm font-bold ${getEvLossColor(pos.avgEvLossPerHandBB)}`}>
                {pos.avgEvLossPerHandBB.toFixed(2)} BB
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PositionStatsTable;