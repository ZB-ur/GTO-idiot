import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface GTOActionComparisonProps {
  userAction: { action: ActionType; amount?: number };
  gtoRecommendation: Array<{ action: ActionType; frequency: number }>;
  isAligned: boolean;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

const ACTION_BAR_COLORS: Record<ActionType, string> = {
  raise: 'bg-amber-400',
  bet: 'bg-amber-400',
  call: 'bg-sky-400',
  check: 'bg-gray-400',
  fold: 'bg-gray-500',
  all_in: 'bg-red-400',
};

export function GTOActionComparison({
  userAction,
  gtoRecommendation,
  isAligned,
}: GTOActionComparisonProps) {
  const sorted = [...gtoRecommendation].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
      {/* Header with alignment badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-50 uppercase tracking-wide">
          GTO Comparison
        </h3>
        <span
          className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
            ${isAligned
              ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30'
              : 'bg-orange-400/15 text-orange-400 border border-orange-400/30'
            }
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAligned ? 'bg-emerald-400' : 'bg-orange-400'}`} />
          {isAligned ? 'Aligned' : 'Deviation'}
        </span>
      </div>

      {/* User Action */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Your Action</div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-50">
            {ACTION_LABELS[userAction.action]}
          </span>
          {userAction.amount !== undefined && (
            <span className="text-base text-gray-400 tabular-nums">{userAction.amount}</span>
          )}
        </div>
      </div>

      {/* GTO Recommendation */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">GTO Recommendation</div>
        <div className="space-y-2.5">
          {sorted.map((rec) => (
            <div key={rec.action} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-16 shrink-0 font-medium">
                {ACTION_LABELS[rec.action]}
              </span>
              <div className="flex-1 h-5 bg-gray-800 rounded-md overflow-hidden">
                <div
                  className={`h-full rounded-md transition-all ${ACTION_BAR_COLORS[rec.action]} ${
                    rec.action === userAction.action ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{ width: `${rec.frequency}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-10 text-right tabular-nums font-medium">
                {rec.frequency}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}