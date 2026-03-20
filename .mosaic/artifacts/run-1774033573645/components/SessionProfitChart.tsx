import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

interface ProfitPoint {
  handNumber: number;
  profitBB: number;
}

interface SessionProfitChartProps {
  profitCurve: ProfitPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ProfitPoint }>;
  label?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value;
  const isPositive = value >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-xs text-gray-500 mb-0.5">Hand #{label}</p>
      <p
        className={`text-sm font-semibold ${
          isPositive ? 'text-emerald-500' : 'text-red-500'
        }`}
      >
        {isPositive ? '+' : ''}
        {value.toFixed(1)} BB
      </p>
    </div>
  );
};

const SessionProfitChart: React.FC<SessionProfitChartProps> = ({ profitCurve }) => {
  const { minProfit, maxProfit, finalProfit } = useMemo(() => {
    if (profitCurve.length === 0) {
      return { minProfit: -10, maxProfit: 10, finalProfit: 0 };
    }
    const profits = profitCurve.map((p) => p.profitBB);
    const min = Math.min(...profits);
    const max = Math.max(...profits);
    const padding = Math.max((max - min) * 0.1, 2);
    return {
      minProfit: Math.floor(min - padding),
      maxProfit: Math.ceil(max + padding),
      finalProfit: profits[profits.length - 1],
    };
  }, [profitCurve]);

  const isPositiveSession = finalProfit >= 0;

  if (profitCurve.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm">
        No hand data yet
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Profit Curve</h3>
        <span
          className={`text-sm font-bold ${
            isPositiveSession ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isPositiveSession ? '+' : ''}
          {finalProfit.toFixed(1)} BB
        </span>
      </div>

      {/* Chart */}
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={profitCurve}
            margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="profitGradientPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGradientNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="handNumber"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              tickFormatter={(v: number) => `#${v}`}
            />
            <YAxis
              domain={[minProfit, maxProfit]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 2" />
            <Area
              type="monotone"
              dataKey="profitBB"
              stroke={isPositiveSession ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fill={
                isPositiveSession
                  ? 'url(#profitGradientPos)'
                  : 'url(#profitGradientNeg)'
              }
              dot={false}
              activeDot={{
                r: 4,
                fill: isPositiveSession ? '#10b981' : '#ef4444',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SessionProfitChart;