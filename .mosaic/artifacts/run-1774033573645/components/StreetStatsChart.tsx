import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FrequencyComparison {
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  userFrequency: number;
  gtoFrequency: number;
  deviation?: number;
}

interface StreetEntry {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  sampleSize: number;
  frequencies: FrequencyComparison[];
}

interface StreetStats {
  streets: StreetEntry[];
}

interface StreetStatsChartProps {
  data: StreetStats;
  isLoading?: boolean;
}

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_COLORS: Record<string, { user: string; gto: string }> = {
  fold: { user: '#ef4444', gto: '#fca5a5' },
  check: { user: '#8b5cf6', gto: '#c4b5fd' },
  call: { user: '#3b82f6', gto: '#93c5fd' },
  raise: { user: '#f59e0b', gto: '#fcd34d' },
  all_in: { user: '#10b981', gto: '#6ee7b7' },
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-in',
};

interface TransformedRow {
  street: string;
  sampleSize: number;
  [key: string]: string | number;
}

function transformData(data: StreetStats): TransformedRow[] {
  return data.streets.map((entry) => {
    const row: TransformedRow = {
      street: STREET_LABELS[entry.street] || entry.street,
      sampleSize: entry.sampleSize,
    };
    entry.frequencies.forEach((freq) => {
      row[`${freq.actionType}_user`] = Math.round(freq.userFrequency * 100);
      row[`${freq.actionType}_gto`] = Math.round(freq.gtoFrequency * 100);
    });
    return row;
  });
}

function getActions(data: StreetStats): string[] {
  const actionSet = new Set<string>();
  data.streets.forEach((s) =>
    s.frequencies.forEach((f) => actionSet.add(f.actionType))
  );
  const order = ['fold', 'check', 'call', 'raise', 'all_in'];
  return order.filter((a) => actionSet.has(a));
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkeletonBar: React.FC = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="flex items-end gap-6 h-48">
      {[0.6, 0.8, 0.5, 0.7].map((h, i) => (
        <div key={i} className="flex-1 flex gap-1 items-end h-full">
          <div
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${h * 100}%` }}
          />
          <div
            className="flex-1 bg-gray-100 rounded-t"
            style={{ height: `${h * 80}%` }}
          />
        </div>
      ))}
    </div>
    <div className="h-3 bg-gray-200 rounded w-full" />
  </div>
);

export const StreetStatsChart: React.FC<StreetStatsChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <SkeletonBar />
      </div>
    );
  }

  const chartData = transformData(data);
  const actions = getActions(data);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Action Frequency by Street
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Your action distribution vs GTO optimal per street
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {actions.map((action) => (
          <div key={action} className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: ACTION_COLORS[action]?.user }}
              />
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: ACTION_COLORS[action]?.gto }}
              />
            </div>
            <span className="text-gray-600">{ACTION_LABELS[action]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <span className="w-3 h-3 rounded-sm bg-gray-700 inline-block" />
          <span className="text-gray-600">You</span>
          <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
          <span className="text-gray-600">GTO</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -8, bottom: 4 }}
          barGap={1}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="street"
            tick={{ fontSize: 13, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          {actions.map((action) => (
            <React.Fragment key={action}>
              <Bar
                dataKey={`${action}_user`}
                name={`${ACTION_LABELS[action]} (You)`}
                fill={ACTION_COLORS[action]?.user}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey={`${action}_gto`}
                name={`${ACTION_LABELS[action]} (GTO)`}
                fill={ACTION_COLORS[action]?.gto}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </React.Fragment>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Sample sizes */}
      <div className="flex justify-around mt-3 pt-3 border-t border-gray-100">
        {data.streets.map((entry) => (
          <div key={entry.street} className="text-center">
            <span className="text-xs text-gray-400">
              {STREET_LABELS[entry.street]}:{' '}
            </span>
            <span className="text-xs font-medium text-gray-600">
              {entry.sampleSize} hands
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreetStatsChart;