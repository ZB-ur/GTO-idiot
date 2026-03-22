/**
 * PositionBreakdownChart — horizontal bar chart showing GTO conformance by position.
 */

import React from 'react';
import type { PositionBreakdown } from '../../types/stats';

interface PositionBreakdownChartProps {
  data: PositionBreakdown | null;
  loading: boolean;
}

const POSITION_ORDER = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;

function conformanceColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function conformanceTextColor(pct: number): string {
  if (pct >= 70) return 'text-emerald-400';
  if (pct >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

export const PositionBreakdownChart: React.FC<PositionBreakdownChartProps> = ({
  data,
  loading,
}) => {
  const sorted = React.useMemo(() => {
    if (!data) return [];
    const map = new Map(data.positions.map((p) => [p.position, p]));
    return POSITION_ORDER.map((pos) => map.get(pos)).filter(Boolean) as typeof data.positions;
  }, [data]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Conformance by Position</h3>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data available</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => (
            <div key={entry.position} className="flex items-center gap-3">
              <span className="w-10 text-xs font-mono font-semibold text-gray-300 text-right">
                {entry.position}
              </span>
              <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${conformanceColor(entry.conformance)}`}
                  style={{ width: `${Math.max(entry.conformance, 2)}%` }}
                />
              </div>
              <span className={`w-14 text-xs font-medium text-right ${conformanceTextColor(entry.conformance)}`}>
                {entry.conformance.toFixed(1)}%
              </span>
              <span className="w-16 text-xs text-gray-500 text-right">
                {entry.handsPlayed} hands
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
