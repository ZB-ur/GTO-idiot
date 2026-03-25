'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GtoComparisonPanelProps {
  userAction: string;
  userAmount?: number;
  gtoRecommendedAction: string;
  gtoRecommendedAmount?: number;
  rating: string; // 'green' | 'yellow' | 'red' | 'gray'
  reason?: string;
  isSimplified: boolean;
  visible: boolean;
}

const RATING_CONFIG: Record<string, { bg: string; border: string; label: string; icon: string; textColor: string }> = {
  green: {
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-700/50',
    label: 'GTO Match',
    icon: '✓',
    textColor: 'text-emerald-400',
  },
  yellow: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700/50',
    label: 'Acceptable',
    icon: '~',
    textColor: 'text-amber-400',
  },
  red: {
    bg: 'bg-red-900/30',
    border: 'border-red-700/50',
    label: 'GTO Error',
    icon: '✗',
    textColor: 'text-red-400',
  },
  gray: {
    bg: 'bg-gray-800/50',
    border: 'border-gray-700/50',
    label: 'No Reference',
    icon: '?',
    textColor: 'text-gray-400',
  },
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

function formatAction(action: string, amount?: number): string {
  const label = ACTION_LABELS[action] ?? action;
  if (amount && amount > 0 && ['bet', 'raise', 'call', 'all_in'].includes(action)) {
    return `${label} ${amount} BB`;
  }
  return label;
}

export default function GtoComparisonPanel({
  userAction,
  userAmount,
  gtoRecommendedAction,
  gtoRecommendedAmount,
  rating,
  reason,
  isSimplified,
  visible,
}: GtoComparisonPanelProps) {
  const config = RATING_CONFIG[rating] ?? RATING_CONFIG.gray;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with rating badge */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">GTO Comparison</h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.textColor} ${config.bg} border ${config.border}`}
            >
              <span>{config.icon}</span>
              {config.label}
            </span>
          </div>

          {/* Split comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Your action */}
            <div className="rounded-lg bg-gray-800/60 p-3 text-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                Your Action
              </span>
              <span className="text-white text-sm font-bold block">
                {formatAction(userAction, userAmount)}
              </span>
            </div>

            {/* GTO recommendation */}
            <div className={`rounded-lg p-3 text-center ${config.bg}`}>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                GTO Optimal
              </span>
              <span className={`text-sm font-bold block ${config.textColor}`}>
                {formatAction(gtoRecommendedAction, gtoRecommendedAmount)}
              </span>
            </div>
          </div>

          {/* Reason callout */}
          {reason && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700/40">
              <p className="text-xs text-gray-300 leading-relaxed">{reason}</p>
            </div>
          )}

          {/* Simplified disclaimer */}
          {isSimplified && (
            <p className="mt-2 text-[10px] text-gray-500 italic text-center">
              * Postflop GTO reference is simplified / approximate
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}