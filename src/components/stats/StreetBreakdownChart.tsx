/**
 * StreetBreakdownChart — vertical bar chart of GTO conformance per street.
 */

import React from 'react';
import type { StreetBreakdown } from '../../types/stats';

interface StreetBreakdownChartProps {
  data: StreetBreakdown | null;
  loading: boolean;
}

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const STREET_ORDER = ['preflop', 'flop', 'turn', 'river'] as const;

function barColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function textColor(pct: number): string {
  if (pct >= 70) return 'text-emerald-400';
  if (pct >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

export const StreetBreakdownChart: React.FC<StreetBreakdownChartProps> = ({
  data,
  loading,
}) => {
  const sorted = React.useMemo(() => {
    if (!data) return [];
    const map = new Map(data.streets.map((s) => [s.street, s]));
    return STREET_ORDER.map((st) => map.get(st)).filter(Boolean) as typeof data.streets;
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Conformance by Street</h3>

      {loading ? (
        <div className="flex items-end justify-around h-44 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-14 bg-gray-700 rounded-t animate-pulse" style={{ height: `${40 + i * 15}%` }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data available</p>
      ) : (
        <div className="flex items-end justify-around h-44 gap-4 pt-4">
          {sorted.map((entry) => {
            const heightPct = Math.max(entry.conformance, 3);
            return (
              <div key={entry.street} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className={`text-xs font-bold mb-1 ${textColor(entry.conformance)}`}>
                  {entry.conformance.toFixed(1)}%
                </span>
                <div
                  className={`w-full max-w-[3rem] rounded-t transition-all duration-500 ${barColor(entry.conformance)}`}
                  style={{ height: `${heightPct}%` }}
                  title={`${entry.decisionCount} decisions`}
                />
                <span className="text-xs text-gray-400 mt-2 font-medium">
                  {STREET_LABELS[entry.street] ?? entry.street}
                </span>
                <span className="text-[10px] text-gray-500">
                  {entry.decisionCount} dec.
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
