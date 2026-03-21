import React from 'react';
import Skeleton from './Skeleton';

type Quality = 'good' | 'minor_deviation' | 'major_deviation';

interface GTOAction {
  action: string;
  amount?: number;
  evBB: number;
  frequency: number;
}

interface DecisionAnalysisProps {
  userAction: { type: string; amount?: number; evBB: number };
  gtoActions: GTOAction[];
  recommendedAction: string;
  evDiffBB: number;
  quality: Quality;
  isLoading?: boolean;
  isDegraded?: boolean;
  className?: string;
}

const qualityConfig: Record<Quality, { bg: string; text: string; border: string; label: string }> = {
  good: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Good Play' },
  minor_deviation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Minor Deviation' },
  major_deviation: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Major Deviation' },
};

function formatAction(type: string, amount?: number): string {
  const label = type.charAt(0).toUpperCase() + type.slice(1).replace('_', '-');
  if (amount !== undefined) return `${label} ${amount.toFixed(1)} BB`;
  return label;
}

export const DecisionAnalysis: React.FC<DecisionAnalysisProps> = ({
  userAction,
  gtoActions,
  recommendedAction,
  evDiffBB,
  quality,
  isLoading = false,
  isDegraded = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
        <Skeleton variant="text" lines={4} />
      </div>
    );
  }

  const qc = qualityConfig[quality];
  const sortedActions = [...gtoActions].sort((a, b) => b.evBB - a.evBB);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {/* Header: Quality badge + EV diff */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${qc.bg} ${qc.text} ${qc.border}`}>
          <span className={`w-2 h-2 rounded-full ${quality === 'good' ? 'bg-emerald-500' : quality === 'minor_deviation' ? 'bg-amber-500' : 'bg-red-500'}`} />
          {qc.label}
        </span>
        <div className="text-right">
          <div className={`text-lg font-bold ${evDiffBB >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {evDiffBB >= 0 ? '+' : ''}{evDiffBB.toFixed(2)} BB
          </div>
          <div className="text-[10px] text-gray-400 font-medium">EV Difference</div>
        </div>
      </div>

      {isDegraded && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
          Analysis computed with heuristic fallback (computation timed out)
        </div>
      )}

      {/* User action */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 font-medium mb-1">Your Action</div>
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-sm font-semibold text-blue-700">
            {formatAction(userAction.type, userAction.amount)}
          </span>
          <span className="text-sm font-bold text-gray-900">EV: {userAction.evBB.toFixed(2)} BB</span>
        </div>
      </div>

      {/* GTO actions table */}
      <div>
        <div className="text-xs text-gray-400 font-medium mb-2">GTO Strategy</div>
        <div className="space-y-1.5">
          {sortedActions.map((action, i) => {
            const isRecommended = action.action === recommendedAction;
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isRecommended
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isRecommended ? 'text-emerald-700' : 'text-gray-700'}`}>
                    {formatAction(action.action, action.amount)}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                      BEST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* Frequency bar */}
                  <div className="flex items-center gap-1.5 w-24">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isRecommended ? 'bg-emerald-500' : 'bg-gray-400'}`}
                        style={{ width: `${action.frequency * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium w-8 text-right">
                      {(action.frequency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className={`font-bold ${isRecommended ? 'text-emerald-700' : 'text-gray-600'}`}>
                    {action.evBB.toFixed(2)} BB
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DecisionAnalysis;