'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface KeyDeviation {
  stepIndex: number;
  rating: string;
  userAction: string;
  gtoAction: string;
  reason: string;
}

interface HandSummaryCardProps {
  gtoConformance: number;
  totalUserDecisions: number;
  gtoMatches: number;
  keyDeviations: KeyDeviation[];
  netResult: number;
  onBackToList: () => void;
  onNextHand?: () => void;
}

const RATING_COLORS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  green: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/30' },
  yellow: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800/30' },
  red: { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/30' },
  gray: { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-gray-800/20', border: 'border-gray-700/30' },
};

function getConformanceColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400';
  if (pct >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function getConformanceRingColor(pct: number): string {
  if (pct >= 80) return 'border-emerald-400';
  if (pct >= 50) return 'border-amber-400';
  return 'border-red-400';
}

export default function HandSummaryCard({
  gtoConformance,
  totalUserDecisions,
  gtoMatches,
  keyDeviations,
  netResult,
  onBackToList,
  onNextHand,
}: HandSummaryCardProps) {
  const conformanceColor = useMemo(() => getConformanceColor(gtoConformance), [gtoConformance]);
  const ringColor = useMemo(() => getConformanceRingColor(gtoConformance), [gtoConformance]);

  return (
    <motion.div
      className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-6 space-y-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Hand Summary</h3>
        <span
          className={`text-sm font-bold tabular-nums ${netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {netResult >= 0 ? '+' : ''}{netResult.toFixed(1)} BB
        </span>
      </div>

      {/* GTO conformance gauge */}
      <div className="flex items-center gap-5">
        <div
          className={`flex-shrink-0 w-20 h-20 rounded-full border-4 ${ringColor} flex items-center justify-center`}
        >
          <span className={`text-2xl font-bold tabular-nums ${conformanceColor}`}>
            {Math.round(gtoConformance)}%
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-gray-200 font-medium">GTO Conformance</p>
          <p className="text-xs text-gray-400">
            {gtoMatches} of {totalUserDecisions} decisions matched GTO
          </p>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                gtoConformance >= 80
                  ? 'bg-emerald-500'
                  : gtoConformance >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, gtoConformance)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key deviations */}
      {keyDeviations.length > 0 && (
        <div>
          <span className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">
            Key Deviations
          </span>
          <div className="flex flex-col gap-2">
            {keyDeviations.map((dev, i) => {
              const colors = RATING_COLORS[dev.rating] ?? RATING_COLORS.gray;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${colors.bg} border ${colors.border}`}
                >
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.dot} text-black text-[10px] font-bold flex items-center justify-center mt-0.5`}
                  >
                    {dev.stepIndex}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-gray-300 font-medium">
                        You: <span className="text-white">{dev.userAction}</span>
                      </span>
                      <span className="text-gray-600">→</span>
                      <span className={`text-xs font-medium ${colors.text}`}>
                        GTO: {dev.gtoAction}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {dev.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All good */}
      {keyDeviations.length === 0 && (
        <div className="text-center py-4 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
          <p className="text-sm text-emerald-300 font-medium">
            Excellent! All decisions matched GTO strategy.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBackToList}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
        >
          Back to List
        </button>
        {onNextHand && (
          <button
            type="button"
            onClick={onNextHand}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Next Hand →
          </button>
        )}
      </div>
    </motion.div>
  );
}