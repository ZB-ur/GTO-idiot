import React from 'react';

interface PositionStat {
  position: string;
  hands: number;
  pnl: number;
  bbPer100: number;
  gtoConformance: number;
}

interface PositionBreakdownTableProps {
  positionStats: PositionStat[];
  onSelectPosition: (position: string) => void;
  selectedPosition?: string;
}

const positionOrder = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

function getConformanceColor(value: number): string {
  if (value < 0) return 'text-gray-500';
  if (value >= 75) return 'text-emerald-500';
  if (value >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getConformanceBarColor(value: number): string {
  if (value < 0) return 'bg-gray-600';
  if (value >= 75) return 'bg-emerald-500';
  if (value >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export const PositionBreakdownTable: React.FC<PositionBreakdownTableProps> = ({
  positionStats,
  onSelectPosition,
  selectedPosition,
}) => {
  const sorted = [...positionStats].sort(
    (a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position),
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-50">Position Breakdown</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left px-5 py-3">Position</th>
            <th className="text-right px-3 py-3">Hands</th>
            <th className="text-right px-3 py-3">P/L (BB)</th>
            <th className="text-right px-3 py-3">bb/100</th>
            <th className="text-right px-5 py-3">GTO %</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((stat) => {
            const isSelected = selectedPosition === stat.position;
            const pnlColor = stat.pnl > 0
              ? 'text-emerald-500'
              : stat.pnl < 0
                ? 'text-red-500'
                : 'text-gray-400';
            const bbColor = stat.bbPer100 > 0
              ? 'text-emerald-500'
              : stat.bbPer100 < 0
                ? 'text-red-500'
                : 'text-gray-400';

            return (
              <tr
                key={stat.position}
                className={`cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/10 border-l-2 border-amber-400' : 'hover:bg-gray-800'}`}
                onClick={() => onSelectPosition(stat.position)}
              >
                <td className="px-5 py-3">
                  <span className="text-sm font-bold text-amber-400">{stat.position}</span>
                </td>
                <td className="text-right px-3 py-3 text-sm text-gray-300 font-mono">{stat.hands}</td>
                <td className={`text-right px-3 py-3 text-sm font-mono font-semibold ${pnlColor}`}>
                  {stat.pnl > 0 ? '+' : ''}{stat.pnl.toFixed(1)}
                </td>
                <td className={`text-right px-3 py-3 text-sm font-mono ${bbColor}`}>
                  {stat.bbPer100 > 0 ? '+' : ''}{stat.bbPer100.toFixed(1)}
                </td>
                <td className="text-right px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getConformanceBarColor(stat.gtoConformance)}`}
                        style={{ width: `${Math.max(0, stat.gtoConformance)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-mono ${getConformanceColor(stat.gtoConformance)}`}>
                      {stat.gtoConformance < 0 ? '—' : `${stat.gtoConformance.toFixed(0)}%`}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PositionBreakdownTable;