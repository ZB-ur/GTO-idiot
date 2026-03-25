import React from 'react';

// --- Type Definitions ---

type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'allin';
type GTOActionType = 'fold' | 'check' | 'call' | 'raise';

interface GTOAction {
  type: GTOActionType;
  frequency: number;
  amount?: number;
}

interface GTOComparison {
  decisionIndex: number;
  heroAction: {
    type: ActionType;
    amount?: number;
  };
  gtoRecommendation: GTOAction[];
  evDifference: number;
  comparisonType: 'preflop_range' | 'postflop_simplified';
  comparisonLabel?: string;
}

interface GTOComparisonPanelProps {
  comparison: GTOComparison | null;
  isHeroDecision: boolean;
}

// --- Helpers ---

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  allin: 'All-In',
};

const ACTION_COLORS: Record<string, string> = {
  fold: 'text-red-500',
  check: 'text-gray-500',
  call: 'text-emerald-500',
  raise: 'text-blue-600',
  allin: 'text-amber-500',
};

const ACTION_BG_COLORS: Record<string, string> = {
  fold: 'bg-red-50 border-red-200',
  check: 'bg-gray-50 border-gray-200',
  call: 'bg-emerald-50 border-emerald-200',
  raise: 'bg-blue-50 border-blue-200',
  allin: 'bg-amber-50 border-amber-200',
};

const GTO_BAR_COLORS: Record<string, string> = {
  fold: 'bg-red-400',
  check: 'bg-gray-400',
  call: 'bg-emerald-400',
  raise: 'bg-blue-500',
};

function formatAction(action: { type: string; amount?: number }): string {
  const label = ACTION_LABELS[action.type] || action.type;
  if ((action.type === 'raise' || action.type === 'allin') && action.amount != null) {
    return `${label} ${action.amount}`;
  }
  return label;
}

function formatEV(ev: number): string {
  const sign = ev >= 0 ? '+' : '';
  return `${sign}${ev.toFixed(1)} BB`;
}

// --- Sub-components ---

function YourActionDisplay({ action }: { action: GTOComparison['heroAction'] }) {
  const colorClass = ACTION_COLORS[action.type] || 'text-gray-900';
  const bgClass = ACTION_BG_COLORS[action.type] || 'bg-gray-50 border-gray-200';

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Action</p>
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${bgClass}`}>
        <span className={`text-base font-semibold ${colorClass}`}>
          {formatAction(action)}
        </span>
      </div>
    </div>
  );
}

function GTORecommendationDisplay({ actions }: { actions: GTOAction[] }) {
  const sorted = [...actions].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">GTO Recommendation</p>
      <div className="space-y-1.5">
        {sorted.map((gtoAction) => {
          const barColor = GTO_BAR_COLORS[gtoAction.type] || 'bg-gray-400';
          return (
            <div key={gtoAction.type} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-16 shrink-0">
                {formatAction(gtoAction)}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
                <div
                  className={`h-full ${barColor} rounded-md transition-all`}
                  style={{ width: `${gtoAction.frequency}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-10 text-right shrink-0">
                {gtoAction.frequency.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EVDifferenceBadge({ ev }: { ev: number }) {
  const isPositive = ev >= 0;
  const isNeutral = Math.abs(ev) < 0.1;

  let bgClass: string;
  let textClass: string;
  let icon: string;

  if (isNeutral) {
    bgClass = 'bg-gray-100';
    textClass = 'text-gray-600';
    icon = '≈';
  } else if (isPositive) {
    bgClass = 'bg-emerald-50 border border-emerald-200';
    textClass = 'text-emerald-700';
    icon = '▲';
  } else {
    bgClass = 'bg-red-50 border border-red-200';
    textClass = 'text-red-700';
    icon = '▼';
  }

  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${bgClass}`}>
      <span className={`text-lg ${textClass}`}>{icon}</span>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-500">EV Difference</p>
        <p className={`text-xl font-bold ${textClass}`}>{formatEV(ev)}</p>
      </div>
    </div>
  );
}

function ApproximationDisclaimer({ label }: { label?: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-sky-50 border border-sky-200 rounded-lg">
      <svg className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs text-sky-700 leading-relaxed">
        {label || 'GTO values are simplified approximations and may not reflect exact solver outputs.'}
      </p>
    </div>
  );
}

function ViewRangeChartLink() {
  return (
    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 4v16M15 4v16" />
      </svg>
      View Range Chart
    </button>
  );
}

// --- Main Component ---

export const GTOComparisonPanel: React.FC<GTOComparisonPanelProps> = ({
  comparison,
  isHeroDecision,
}) => {
  if (!isHeroDecision || !comparison) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-400 text-center">
          {!isHeroDecision
            ? 'GTO comparison is only available for your decisions.'
            : 'Select a decision point to see GTO analysis.'}
        </p>
      </div>
    );
  }

  const isPreflopRange = comparison.comparisonType === 'preflop_range';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">GTO Comparison</h3>
        {comparison.comparisonLabel && (
          <p className="text-xs text-gray-500 mt-0.5">{comparison.comparisonLabel}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* EV Badge */}
        <EVDifferenceBadge ev={comparison.evDifference} />

        {/* Your Action vs GTO */}
        <div className="grid grid-cols-1 gap-4">
          <YourActionDisplay action={comparison.heroAction} />
          <GTORecommendationDisplay actions={comparison.gtoRecommendation} />
        </div>

        {/* Range Chart Link (preflop only) */}
        {isPreflopRange && <ViewRangeChartLink />}

        {/* Disclaimer */}
        <ApproximationDisclaimer label={comparison.comparisonLabel} />
      </div>
    </div>
  );
};

export default GTOComparisonPanel;