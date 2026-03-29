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

interface PositionEntry {
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  sampleSize: number;
  frequencies: FrequencyComparison[];
}

interface PositionStats {
  positions: PositionEntry[];
}

interface PositionStatsChartProps {
  data: PositionStats;
  isLoading?: boolean;
}

type ActionFilter = 'raise' | 'call' | 'fold' | 'all';

const ACTION_COLORS: Record<string, string> = {
  raise: '#2563eb',
  call: '#10b981',
  fold: '#6b7280',
  check: '#f59e0b',
  all_in: '#ef4444',
};

const ACTION_LABELS: Record<string, string> = {
  raise: 'Raise',
  call: 'Call',
  fold: 'Fold',
  check: 'Check',
  all_in: 'All-in',
};

function SkeletonBar() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-64 bg-gray-100 rounded-lg" />
    </div>
  );
}

export default function PositionStatsChart({ data, isLoading }: PositionStatsChartProps) {
  const [actionFilter, setActionFilter] = React.useState<ActionFilter>('raise');

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse h-5 bg-gray-200 rounded w-48 mb-6" />
        <SkeletonBar />
      </div>
    );
  }

  const chartData = data.positions.map((pos) => {
    const result: Record<string, string | number> = {
      position: pos.position,
      sampleSize: pos.sampleSize,
    };

    if (actionFilter === 'all') {
      pos.frequencies.forEach((f) => {
        result[`user_${f.actionType}`] = Math.round(f.userFrequency * 100);
        result[`gto_${f.actionType}`] = Math.round(f.gtoFrequency * 100);
      });
    } else {
      const freq = pos.frequencies.find((f) => f.actionType === actionFilter);
      result.user = freq ? Math.round(freq.userFrequency * 100) : 0;
      result.gto = freq ? Math.round(freq.gtoFrequency * 100) : 0;
    }

    return result;
  });

  const filters: { key: ActionFilter; label: string }[] = [
    { key: 'raise', label: 'Raise' },
    { key: 'call', label: 'Call' },
    { key: 'fold', label: 'Fold' },
    { key: 'all', label: 'All Actions' },
  ];

  const renderBars = () => {
    if (actionFilter === 'all') {
      const actions = ['raise', 'call', 'fold'];
      return actions.flatMap((action) => [
        <Bar
          key={`user_${action}`}
          dataKey={`user_${action}`}
          name={`You - ${ACTION_LABELS[action]}`}
          fill={ACTION_COLORS[action]}
          fillOpacity={0.8}
          radius={[2, 2, 0, 0]}
        />,
        <Bar
          key={`gto_${action}`}
          dataKey={`gto_${action}`}
          name={`GTO - ${ACTION_LABELS[action]}`}
          fill={ACTION_COLORS[action]}
          fillOpacity={0.3}
          radius={[2, 2, 0, 0]}
          stroke={ACTION_COLORS[action]}
          strokeWidth={1}
          strokeDasharray="3 3"
        />,
      ]);
    }

    return [
      <Bar
        key="user"
        dataKey="user"
        name="You"
        fill="#2563eb"
        radius={[4, 4, 0, 0]}
        maxBarSize={40}
      />,
      <Bar
        key="gto"
        dataKey="gto"
        name="GTO"
        fill="#2563eb"
        fillOpacity={0.2}
        stroke="#2563eb"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        radius={[4, 4, 0, 0]}
        maxBarSize={40}
      />,
    ];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const posData = data.positions.find((p) => p.position === label);
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">
          {label}{' '}
          <span className="text-gray-400 font-normal">
            ({posData?.sampleSize ?? 0} hands)
          </span>
        </p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: entry.color, opacity: entry.fillOpacity ?? 1 }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Action by Position</h3>
          <p className="text-sm text-gray-500 mt-0.5">Your frequency vs GTO baseline</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActionFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                actionFilter === f.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} barGap={2} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="position"
            tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            iconType="square"
            iconSize={10}
          />
          {renderBars()}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}