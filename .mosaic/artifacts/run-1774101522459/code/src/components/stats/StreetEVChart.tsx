// ============================================================
// StreetEVChart — Bar chart showing EV loss by street (Recharts)
// ============================================================

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { StreetStats } from '../../types/stats';
import { Skeleton } from '../common/Skeleton';

interface StreetEVChartProps {
  data: StreetStats[] | null;
  loading: boolean;
}

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const BAR_COLORS = {
  good: '#4ade80', // green-400
  minor: '#facc15', // yellow-400
  major: '#f87171', // red-400
  neutral: '#6b7280', // gray-500
};

function getBarColor(avgEvLoss: number): string {
  if (avgEvLoss >= -0.5) return BAR_COLORS.good;
  if (avgEvLoss >= -2) return BAR_COLORS.minor;
  if (avgEvLoss < -2) return BAR_COLORS.major;
  return BAR_COLORS.neutral;
}

interface ChartDataPoint {
  street: string;
  label: string;
  totalEvLoss: number;
  avgEvLoss: number;
  decisions: number;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-200 mb-1">{data.label}</p>
      <p className="text-gray-400">
        Decisions:{' '}
        <span className="text-gray-200">{data.decisions}</span>
      </p>
      <p className="text-gray-400">
        Total EV Loss:{' '}
        <span className="text-red-400">{data.totalEvLoss.toFixed(2)} BB</span>
      </p>
      <p className="text-gray-400">
        Avg EV / Decision:{' '}
        <span className="text-red-400">{data.avgEvLoss.toFixed(2)} BB</span>
      </p>
    </div>
  );
};

export const StreetEVChart: React.FC<StreetEVChartProps> = ({
  data,
  loading,
}) => {
  if (loading || !data) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          EV Loss by Street
        </h3>
        <Skeleton height="h-64" variant="rect" />
      </div>
    );
  }

  const hasDecisions = data.some((s) => s.decisionCount > 0);

  if (!hasDecisions) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          EV Loss by Street
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          No decision data yet. Play some hands to see EV analysis by street.
        </div>
      </div>
    );
  }

  const chartData: ChartDataPoint[] = data.map((s) => ({
    street: s.street,
    label: STREET_LABELS[s.street] ?? s.street,
    totalEvLoss: Math.abs(s.totalEvLossBB),
    avgEvLoss: s.avgEvLossPerDecisionBB,
    decisions: s.decisionCount,
  }));

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        EV Loss by Street
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            label={{
              value: 'EV Loss (BB)',
              angle: -90,
              position: 'insideLeft',
              fill: '#9ca3af',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }} />
          <Bar dataKey="totalEvLoss" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={getBarColor(entry.avgEvLoss)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
          Good (&lt; 0.5 BB)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block" />
          Minor (0.5-2 BB)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
          Major (&gt; 2 BB)
        </span>
      </div>
    </div>
  );
};
