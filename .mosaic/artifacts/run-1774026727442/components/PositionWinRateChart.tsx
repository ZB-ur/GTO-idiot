import React, { useMemo } from 'react';

type SeatPosition = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface PositionData {
  position: SeatPosition;
  hands: number;
  winRate: number;
  avgProfit: number;
}

interface PositionWinRateChartProps {
  data: PositionData[];
}

const POSITION_ORDER: SeatPosition[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const POSITION_COLORS: Record<SeatPosition, string> = {
  UTG: 'bg-red-500',
  MP: 'bg-orange-500',
  CO: 'bg-amber-400',
  BTN: 'bg-emerald-400',
  SB: 'bg-blue-400',
  BB: 'bg-purple-400',
};

const POSITION_COLORS_TEXT: Record<SeatPosition, string> = {
  UTG: 'text-red-500',
  MP: 'text-orange-500',
  CO: 'text-amber-400',
  BTN: 'text-emerald-400',
  SB: 'text-blue-400',
  BB: 'text-purple-400',
};

export default function PositionWinRateChart({ data }: PositionWinRateChartProps) {
  const sortedData = useMemo(() => {
    const map = new Map(data.map((d) => [d.position, d]));
    return POSITION_ORDER.map(
      (pos) => map.get(pos) ?? { position: pos, hands: 0, winRate: 0, avgProfit: 0 }
    );
  }, [data]);

  const maxWinRate = useMemo(
    () => Math.max(...sortedData.map((d) => d.winRate), 0.01),
    [sortedData]
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">按位置胜率分布</h3>
        <span className="text-sm text-gray-500">Win Rate by Position</span>
      </div>

      {/* Chart area */}
      <div className="flex items-end gap-3 h-48 mb-4 px-2">
        {sortedData.map((item) => {
          const heightPercent = maxWinRate > 0 ? (item.winRate / maxWinRate) * 100 : 0;
          return (
            <div key={item.position} className="flex-1 flex flex-col items-center gap-2">
              {/* Win rate label */}
              <span className="text-xs font-medium text-gray-300">
                {(item.winRate * 100).toFixed(1)}%
              </span>
              {/* Bar */}
              <div className="w-full flex justify-center" style={{ height: '100%' }}>
                <div className="w-full max-w-[48px] flex items-end h-full">
                  <div
                    className={`w-full ${POSITION_COLORS[item.position]} rounded-t-md transition-all duration-500 ease-out`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Position labels */}
      <div className="flex gap-3 px-2 mb-6">
        {sortedData.map((item) => (
          <div key={item.position} className="flex-1 text-center">
            <span
              className={`text-sm font-bold ${POSITION_COLORS_TEXT[item.position]}`}
            >
              {item.position}
            </span>
          </div>
        ))}
      </div>

      {/* Stats table */}
      <div className="border-t border-gray-700 pt-4">
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2 px-1">
          <span>位置</span>
          <span className="text-center">手数</span>
          <span className="text-right">平均盈亏</span>
        </div>
        {sortedData.map((item) => (
          <div
            key={item.position}
            className="grid grid-cols-3 gap-2 text-sm py-1.5 px-1 rounded hover:bg-gray-700/50 transition-colors"
          >
            <span className={`font-semibold ${POSITION_COLORS_TEXT[item.position]}`}>
              {item.position}
            </span>
            <span className="text-center text-gray-300">{item.hands}</span>
            <span
              className={`text-right font-medium ${
                item.avgProfit > 0
                  ? 'text-green-400'
                  : item.avgProfit < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {item.avgProfit > 0 ? '+' : ''}
              {item.avgProfit.toFixed(1)} BB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}