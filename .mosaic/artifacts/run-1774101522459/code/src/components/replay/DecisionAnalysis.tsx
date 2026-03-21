// ============================================================
// DecisionAnalysis — GTO decision analysis panel for replay
// Shows user action vs GTO recommendation, EV diff, action EVs
// ============================================================

import React from 'react';
import type { DecisionPointAnalysis, GTOActionEV, DecisionQuality } from '../../types';

interface DecisionAnalysisProps {
  /** The decision point to analyze (null if current step is not a user decision) */
  decisionPoint: DecisionPointAnalysis | null;
  /** Compact mode for sidebar layout */
  compact?: boolean;
}

// ============================================================
// Quality badge colors
// ============================================================

const QUALITY_CONFIG: Record<DecisionQuality, { label: string; bg: string; text: string; border: string }> = {
  good: {
    label: 'Good',
    bg: 'bg-green-900/40',
    text: 'text-green-400',
    border: 'border-green-700/50',
  },
  minor_deviation: {
    label: 'Minor Deviation',
    bg: 'bg-yellow-900/40',
    text: 'text-yellow-400',
    border: 'border-yellow-700/50',
  },
  major_deviation: {
    label: 'Major Deviation',
    bg: 'bg-red-900/40',
    text: 'text-red-400',
    border: 'border-red-700/50',
  },
};

// ============================================================
// Helper: format action name
// ============================================================

function formatAction(action: string, amount?: number | null): string {
  const name = action.replace('_', '-');
  if (amount != null && amount > 0) {
    return `${name} ${amount.toFixed(1)} BB`;
  }
  return name;
}

// ============================================================
// Helper: EV bar component
// ============================================================

function EVBar({ actionEv, maxEv, isRecommended, isUserAction }: {
  actionEv: GTOActionEV;
  maxEv: number;
  isRecommended: boolean;
  isUserAction: boolean;
}) {
  const evRange = Math.max(Math.abs(maxEv), 1);
  const barWidth = Math.max(5, Math.min(100, ((actionEv.evBB + evRange) / (2 * evRange)) * 100));

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Action label */}
      <div className="w-24 shrink-0 text-right">
        <span className={`text-xs font-medium capitalize ${
          isUserAction ? 'text-blue-400' : isRecommended ? 'text-green-400' : 'text-gray-400'
        }`}>
          {formatAction(actionEv.action, actionEv.amount)}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isRecommended ? 'bg-green-600' : isUserAction ? 'bg-blue-600' : 'bg-gray-600'
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* EV value */}
      <div className="w-16 shrink-0 text-right">
        <span className={`text-xs font-mono ${
          actionEv.evBB >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {actionEv.evBB >= 0 ? '+' : ''}{actionEv.evBB.toFixed(2)}
        </span>
      </div>

      {/* Frequency */}
      <div className="w-10 shrink-0 text-right">
        <span className="text-xs text-gray-500">
          {(actionEv.frequency * 100).toFixed(0)}%
        </span>
      </div>

      {/* Markers */}
      <div className="w-4 shrink-0">
        {isRecommended && (
          <span className="text-green-400 text-xs" title="GTO Recommended">★</span>
        )}
        {isUserAction && !isRecommended && (
          <span className="text-blue-400 text-xs" title="Your Action">●</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

const DecisionAnalysis: React.FC<DecisionAnalysisProps> = ({ decisionPoint, compact = false }) => {
  if (!decisionPoint) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-800/40 rounded-lg border border-gray-700/30`}>
        <div className="text-center text-gray-500 text-sm py-4">
          <div className="text-2xl mb-2">📊</div>
          Navigate to a decision point to see GTO analysis
        </div>
      </div>
    );
  }

  const { userAction, gtoEvaluation, evDiffBB, quality, street } = decisionPoint;
  const qualityConfig = QUALITY_CONFIG[quality];
  const maxEv = Math.max(...gtoEvaluation.actions.map((a) => Math.abs(a.evBB)), 1);

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-800/40 rounded-lg border border-gray-700/30 space-y-3`}>
      {/* Header: Quality badge + Street */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {street}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${qualityConfig.bg} ${qualityConfig.text} ${qualityConfig.border}`}>
            {qualityConfig.label}
          </span>
        </div>
        <div className={`text-sm font-mono font-semibold ${evDiffBB >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {evDiffBB >= 0 ? '+' : ''}{evDiffBB.toFixed(2)} BB
        </div>
      </div>

      {/* User action vs GTO recommendation */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900/40 rounded-md p-2">
          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Your Action</div>
          <div className="text-sm font-medium text-blue-400 capitalize">
            {formatAction(userAction.type, userAction.amount)}
          </div>
          <div className={`text-xs font-mono ${userAction.evBB >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            EV: {userAction.evBB >= 0 ? '+' : ''}{userAction.evBB.toFixed(2)} BB
          </div>
        </div>
        <div className="bg-gray-900/40 rounded-md p-2">
          <div className="text-[10px] text-gray-500 uppercase mb-0.5">GTO Optimal</div>
          <div className="text-sm font-medium text-green-400 capitalize">
            {formatAction(gtoEvaluation.recommendedAction, gtoEvaluation.recommendedAmount)}
          </div>
          <div className="text-xs text-gray-400">
            Str: {(gtoEvaluation.handStrength * 100).toFixed(0)}%
            {' · '}
            SPR: {gtoEvaluation.spr.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Action EV breakdown */}
      {!compact && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase mb-1.5 flex items-center justify-between">
            <span>Action EV Breakdown</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600" /> GTO
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> You
              </span>
            </span>
          </div>
          <div className="space-y-0.5">
            {gtoEvaluation.actions
              .slice()
              .sort((a, b) => b.evBB - a.evBB)
              .map((actionEv) => (
                <EVBar
                  key={`${actionEv.action}-${actionEv.amount}`}
                  actionEv={actionEv}
                  maxEv={maxEv}
                  isRecommended={actionEv.action === gtoEvaluation.recommendedAction}
                  isUserAction={actionEv.action === userAction.type}
                />
              ))}
          </div>
        </div>
      )}

      {/* Degraded warning */}
      {gtoEvaluation.isDegraded && (
        <div className="text-[10px] text-yellow-500 flex items-center gap-1">
          <span>⚠</span>
          <span>Heuristic estimate (computation timed out)</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(DecisionAnalysis);
