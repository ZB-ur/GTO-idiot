import React, { useEffect, useState, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────
type DeviationSeverity = 'minor' | 'moderate' | 'severe';

interface DeviationItem {
  type: string;
  count: number;
  totalEvLoss: number;
  avgSeverity: DeviationSeverity;
  exampleHandIds?: string[];
}

interface DeviationRankingProps {
  deviations: DeviationItem[];
  onHandClick?: (handId: string) => void;
}

// ── Severity config ────────────────────────────────────────────
const severityConfig: Record<
  DeviationSeverity,
  { dot: string; bg: string; text: string; label: string }
> = {
  minor: {
    dot: 'bg-green-400',
    bg: 'bg-green-400/10',
    text: 'text-green-400',
    label: '轻微',
  },
  moderate: {
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-400/10',
    text: 'text-yellow-400',
    label: '中等',
  },
  severe: {
    dot: 'bg-red-400',
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    label: '严重',
  },
};

// ── DeviationMarker (inline child) ─────────────────────────────
function DeviationMarker({ severity }: { severity: DeviationSeverity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        text-xs font-medium rounded-lg
        ${config.bg} ${config.text}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function DeviationRanking({
  deviations,
  onHandClick,
}: DeviationRankingProps) {
  // Compute max EV loss for bar scaling
  const maxEvLoss = Math.max(...deviations.map((d) => d.totalEvLoss), 1);

  if (deviations.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-50 mb-4">
          GTO 偏差 TOP 5
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="w-10 h-10 mb-3 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">暂无偏差数据</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-50">
          GTO 偏差 TOP 5
        </h3>
        <span className="text-xs text-gray-500">
          共 {deviations.reduce((sum, d) => sum + d.count, 0)} 次偏差
        </span>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {deviations.map((deviation, index) => (
          <div
            key={deviation.type}
            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
          >
            {/* Top row: rank + type + severity badge */}
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-50 truncate">
                    {deviation.type}
                  </span>
                  <DeviationMarker severity={deviation.avgSeverity} />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 ml-10 mb-2">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-xs text-gray-400">
                  <span className="text-gray-50 font-semibold">
                    {deviation.count}
                  </span>{' '}
                  次
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
                <span className="text-xs text-gray-400">
                  总损失{' '}
                  <span className="text-red-400 font-semibold">
                    -{deviation.totalEvLoss.toFixed(1)} BB
                  </span>
                </span>
              </div>
            </div>

            {/* EV Loss Bar */}
            <div className="ml-10 mb-2">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${(deviation.totalEvLoss / maxEvLoss) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Example hand links */}
            {deviation.exampleHandIds &&
              deviation.exampleHandIds.length > 0 && (
                <div className="ml-10 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">案例:</span>
                  {deviation.exampleHandIds.slice(0, 3).map((handId) => (
                    <button
                      key={handId}
                      onClick={() => onHandClick?.(handId)}
                      className="text-xs text-emerald-500 hover:text-emerald-400 font-mono underline underline-offset-2 transition-colors"
                    >
                      #{handId.slice(-6)}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
        {(['minor', 'moderate', 'severe'] as const).map((sev) => {
          const cfg = severityConfig[sev];
          return (
            <span key={sev} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export { DeviationRanking, DeviationMarker };
export type { DeviationItem, DeviationRankingProps, DeviationSeverity };