// ============================================================
// ProfitTrendChart — Line chart of cumulative profit over time
// ============================================================

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ProfitTrend, ProfitTrendGroupBy } from '../../types/stats';
import { Skeleton } from '../common/Skeleton';

interface ProfitTrendChartProps {
  data: ProfitTrend | null;
  loading: boolean;
  onGroupByChange?: (groupBy: ProfitTrendGroupBy) => void;
}

interface TooltipPayload {
  payload: {
    label: string;
    cumulativeProfitBB: number;
    evLossBB: number;
  };
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayload[];
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  const profitColor =
    data.cumulativeProfitBB >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-200 mb-1">{data.label}</p>
      <p className="text-gray-400">
        Cumulative P/L:{' '}
        <span className={profitColor}>
          {data.cumulativeProfitBB >= 0 ? '+' : ''}
          {data.cumulativeProfitBB.toFixed(1)} BB
        </span>
      </p>
      {data.evLossBB !== 0 && (
        <p className="text-gray-400">
          Cumulative EV Loss:{' '}
          <span className="text-yellow-400">
            {data.evLossBB.toFixed(1)} BB
          </span>
        </p>
      )}
    </div>
  );
};

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  data,
  loading,
  onGroupByChange,
}) => {
  const [groupBy, setGroupBy] = useState<ProfitTrendGroupBy>(
    data?.groupBy ?? 'hand',
  );

  const handleGroupByChange = (newGroupBy: ProfitTrendGroupBy) => {
    setGroupBy(newGroupBy);
    onGroupByChange?.(newGroupBy);
  };

  if (loading || !data) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Profit Trend
        </h3>
        <Skeleton height="h-72" variant="rect" />
      </div>
    );
  }

  if (data.dataPoints.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Profit Trend
        </h3>
        <div className="h-72 flex items-center justify-center text-gray-500 text-sm">
          No data yet. Complete some hands to see your profit trend.
        </div>
      </div>
    );
  }

  // Determine Y-axis domain with padding
  const profits = data.dataPoints.map((dp) => dp.cumulativeProfitBB);
  const minProfit = Math.min(0, ...profits);
  const maxProfit = Math.max(0, ...profits);
  const padding = Math.max(Math.abs(maxProfit - minProfit) * 0.1, 5);

  // Determine gradient: green above 0, red below
  const lastProfit = data.dataPoints[data.dataPoints.length - 1]?.cumulativeProfitBB ?? 0;
  const lineColor = lastProfit >= 0 ? '#4ade80' : '#f87171';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Profit Trend</h3>
        {onGroupByChange && (
          <div className="flex rounded-lg bg-gray-700 p-0.5">
            <button
              onClick={() => handleGroupByChange('hand')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                groupBy === 'hand'
                  ? 'bg-gray-600 text-gray-200'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              By Hand
            </button>
            <button
              onClick={() => handleGroupByChange('session')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                groupBy === 'session'
                  ? 'bg-gray-600 text-gray-200'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              By Session
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data.dataPoints}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="index"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            label={{
              value: groupBy === 'hand' ? 'Hand #' : 'Session #',
              position: 'insideBottom',
              offset: -4,
              fill: '#9ca3af',
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            domain={[minProfit - padding, maxProfit + padding]}
            label={{
              value: 'Cumulative P/L (BB)',
              angle: -90,
              position: 'insideLeft',
              fill: '#9ca3af',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="cumulativeProfitBB"
            stroke={lineColor}
            strokeWidth={2}
            dot={data.dataPoints.length <= 50}
            activeDot={{ r: 4, fill: lineColor, stroke: '#1f2937' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
