import React from 'react';

export interface StreetData {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  conformance: number;
  decisionCount: number;
}

export interface StreetBreakdown {
  streets: StreetData[];
}

interface StreetBreakdownChartProps {
  data: StreetBreakdown;
  isLoading?: boolean;
}

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const STREET_ORDER = ['preflop', 'flop', 'turn', 'river'] as const;

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="space-y-4 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

const getBarColor = (conformance: number): string => {
  if (conformance >= 75) return 'bg-green-500';
  if (conformance >= 50) return 'bg-blue-600';
  if (conformance >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getBarColorBg = (conformance: number): string => {
  if (conformance >= 75) return 'bg-green-100';
  if (conformance >= 50) return 'bg-blue-100';
  if (conformance >= 30) return 'bg-yellow-100';
  return 'bg-red-100';
};

export const StreetBreakdownChart: React.FC<StreetBreakdownChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <SkeletonLoader />
      </div>
    );
  }

  const sorted = STREET_ORDER.map(
    (s) => data.streets.find((st) => st.street === s)
  ).filter(Boolean) as StreetData[];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conformance by Street</h3>
      <div className="space-y-4">
        {sorted.map((s) => (
          <div key={s.street}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {STREET_LABELS[s.street]}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {s.conformance.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">
                  {s.decisionCount} decisions
                </span>
              </div>
            </div>
            <div className={`w-full h-3 rounded-full ${getBarColorBg(s.conformance)}`}>
              <div
                className={`h-3 rounded-full ${getBarColor(s.conformance)} transition-all duration-500`}
                style={{ width: `${Math.min(s.conformance, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreetBreakdownChart;