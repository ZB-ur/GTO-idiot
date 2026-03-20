import React from 'react';

type BotStyle = 'GTO' | 'LAG' | 'TAG' | 'Fish';

interface BotStyleWinRateData {
  botStyle: BotStyle;
  hands: number;
  winRate: number;
  avgProfit: number;
}

interface BotStyleWinRateChartProps {
  data: BotStyleWinRateData[];
}

const BOT_STYLE_CONFIG: Record<BotStyle, { label: string; color: string; bgClass: string; barClass: string }> = {
  GTO: { label: 'GTO', color: '#10b981', bgClass: 'bg-emerald-500', barClass: 'bg-emerald-500' },
  LAG: { label: 'LAG', color: '#f59e0b', bgClass: 'bg-amber-500', barClass: 'bg-amber-500' },
  TAG: { label: 'TAG', color: '#3b82f6', bgClass: 'bg-blue-500', barClass: 'bg-blue-500' },
  Fish: { label: 'Fish', color: '#ef4444', bgClass: 'bg-red-500', barClass: 'bg-red-500' },
};

export const BotStyleWinRateChart: React.FC<BotStyleWinRateChartProps> = ({ data }) => {
  const maxWinRate = Math.max(...data.map(d => d.winRate), 0.01);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Bot 风格胜率对比</h3>
        <span className="text-sm text-gray-500">
          共 {data.reduce((sum, d) => sum + d.hands, 0)} 手
        </span>
      </div>

      {/* Chart Area */}
      <div className="space-y-5">
        {data.map((item) => {
          const config = BOT_STYLE_CONFIG[item.botStyle];
          const barWidth = (item.winRate / maxWinRate) * 100;
          const profitPositive = item.avgProfit >= 0;

          return (
            <div key={item.botStyle} className="space-y-1.5">
              {/* Label Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-sm ${config.bgClass}`}
                  />
                  <span className="text-sm font-medium text-white">{config.label}</span>
                  <span className="text-xs text-gray-500">{item.hands} 手</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {(item.winRate * 100).toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      profitPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {profitPositive ? '+' : ''}
                    {item.avgProfit.toFixed(1)} BB
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-4 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${config.barClass} rounded-lg transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(barWidth, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">最高胜率</p>
            <p className="text-sm font-semibold text-green-400">
              vs{' '}
              {
                BOT_STYLE_CONFIG[
                  [...data].sort((a, b) => b.winRate - a.winRate)[0]?.botStyle ?? 'GTO'
                ].label
              }
              {' '}
              {((data.reduce((best, d) => (d.winRate > best.winRate ? d : best), data[0])?.winRate ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">最低胜率</p>
            <p className="text-sm font-semibold text-red-400">
              vs{' '}
              {
                BOT_STYLE_CONFIG[
                  [...data].sort((a, b) => a.winRate - b.winRate)[0]?.botStyle ?? 'GTO'
                ].label
              }
              {' '}
              {((data.reduce((worst, d) => (d.winRate < worst.winRate ? d : worst), data[0])?.winRate ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotStyleWinRateChart;