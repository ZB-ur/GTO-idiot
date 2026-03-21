import React from 'react';

interface PositionData {
  position: string;
  hands: number;
  netProfitBB: number;
  bbPer100?: number;
}

interface PositionBreakdownProps {
  positions: PositionData[];
  onPositionClick?: (position: string) => void;
}

export const PositionBreakdown: React.FC<PositionBreakdownProps> = ({
  positions,
  onPositionClick,
}) => {
  const maxAbsProfit = Math.max(
    ...positions.map((p) => Math.abs(p.netProfitBB)),
    1
  );

  const getBarHeight = (value: number) => {
    return (Math.abs(value) / maxAbsProfit) * 100;
  };

  const formatBB = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)} BB`;
  };

  const formatBBPer100 = (value?: number) => {
    if (value == null) return '—';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-50 mb-1">
        Position Breakdown
      </h3>
      <p className="text-sm text-gray-500 mb-6">Profit/Loss by Position</p>

      {/* Chart area */}
      <div className="flex items-end justify-between gap-3 h-48 mb-2 px-2">
        {positions.map((pos) => {
          const isPositive = pos.netProfitBB >= 0;
          const barHeight = getBarHeight(pos.netProfitBB);

          return (
            <button
              key={pos.position}
              onClick={() => onPositionClick?.(pos.position)}
              className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer focus:outline-none"
              aria-label={`${pos.position}: ${formatBB(pos.netProfitBB)}`}
            >
              {/* Value label */}
              <span
                className={`text-xs font-medium mb-1 ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatBB(pos.netProfitBB)}
              </span>

              {/* Bar */}
              <div
                className={`w-full max-w-[48px] rounded-t-lg transition-all duration-200 group-hover:opacity-80 ${
                  isPositive
                    ? 'bg-emerald-500 group-hover:bg-emerald-400'
                    : 'bg-red-500 group-hover:bg-red-400'
                }`}
                style={{ height: `${Math.max(barHeight, 4)}%` }}
              />
            </button>
          );
        })}
      </div>

      {/* Zero line */}
      <div className="border-t border-gray-600 mx-2 mb-3" />

      {/* Position labels */}
      <div className="flex justify-between gap-3 px-2">
        {positions.map((pos) => (
          <div key={pos.position} className="flex-1 text-center">
            <div className="text-sm font-semibold text-gray-50">
              {pos.position}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {pos.hands} hands
            </div>
          </div>
        ))}
      </div>

      {/* BB/100 row */}
      <div className="flex justify-between gap-3 px-2 mt-3 pt-3 border-t border-gray-800">
        {positions.map((pos) => {
          const bbVal = pos.bbPer100;
          const isPositive = bbVal != null && bbVal >= 0;
          return (
            <div key={pos.position} className="flex-1 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                BB/100
              </div>
              <div
                className={`text-sm font-medium ${
                  bbVal == null
                    ? 'text-gray-500'
                    : isPositive
                      ? 'text-emerald-400'
                      : 'text-red-400'
                }`}
              >
                {formatBBPer100(bbVal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PositionBreakdown;