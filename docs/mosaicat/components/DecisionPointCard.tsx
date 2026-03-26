import React from 'react';

// Types from API spec
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in' | 'post-blind';
type Street = 'preflop' | 'flop' | 'turn' | 'river';
type DeviationStatus = 'correct' | 'deviation';

interface GtoActionFrequency {
  actionType: ActionType;
  amount?: number | null;
  frequency: number;
}

interface DecisionAnalysis {
  decisionId: string;
  street: Street;
  userAction: ActionType;
  userActionAmount?: number | null;
  gtoRecommendedAction: ActionType;
  gtoRecommendedAmount?: number | null;
  gtoActionFrequencies?: GtoActionFrequency[];
  deviationStatus: DeviationStatus;
  explanation: string;
}

interface DecisionPointCardProps {
  decisionAnalysis: DecisionAnalysis;
  userActionAmount?: number;
}

const streetLabels: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

const actionLabels: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  'all-in': 'All-In',
  'post-blind': 'Post Blind',
};

const actionColors: Record<ActionType, string> = {
  fold: 'text-gray-500',
  check: 'text-blue-600',
  call: 'text-blue-600',
  bet: 'text-amber-600',
  raise: 'text-amber-600',
  'all-in': 'text-red-600',
  'post-blind': 'text-gray-500',
};

function formatAmount(action: ActionType, amount?: number | null): string {
  const label = actionLabels[action];
  if (amount != null && ['bet', 'raise', 'call', 'all-in'].includes(action)) {
    return `${label} ${amount}`;
  }
  return label;
}

/** Deviation badge child component */
function DeviationBadge({ status }: { status: DeviationStatus }) {
  if (status === 'correct') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        正确
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200">
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      偏离
    </span>
  );
}

/** GTO explanation text child component */
function GtoExplanationText({ explanation }: { explanation: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-gray-700">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 5v3.5M8 10.5h.007" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        GTO 分析
      </div>
      {explanation}
    </div>
  );
}

/** Frequency bar for GTO mixed strategy */
function FrequencyBar({ frequencies }: { frequencies: GtoActionFrequency[] }) {
  const barColors: Record<string, string> = {
    fold: 'bg-gray-400',
    check: 'bg-blue-400',
    call: 'bg-blue-500',
    bet: 'bg-amber-500',
    raise: 'bg-amber-600',
    'all-in': 'bg-red-500',
    'post-blind': 'bg-gray-300',
  };

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-500">GTO 混合策略</div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {frequencies
          .filter((f) => f.frequency > 0)
          .map((f, i) => (
            <div
              key={i}
              className={`${barColors[f.actionType] ?? 'bg-gray-300'} transition-all`}
              style={{ width: `${f.frequency * 100}%` }}
              title={`${actionLabels[f.actionType]}${f.amount ? ` ${f.amount}` : ''}: ${Math.round(f.frequency * 100)}%`}
            />
          ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {frequencies
          .filter((f) => f.frequency > 0)
          .map((f, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`inline-block h-2 w-2 rounded-full ${barColors[f.actionType] ?? 'bg-gray-300'}`} />
              {formatAmount(f.actionType, f.amount)} {Math.round(f.frequency * 100)}%
            </span>
          ))}
      </div>
    </div>
  );
}

export default function DecisionPointCard({ decisionAnalysis, userActionAmount }: DecisionPointCardProps) {
  const {
    street,
    userAction,
    userActionAmount: analysisAmount,
    gtoRecommendedAction,
    gtoRecommendedAmount,
    gtoActionFrequencies,
    deviationStatus,
    explanation,
  } = decisionAnalysis;

  const displayAmount = userActionAmount ?? analysisAmount;
  const isDeviation = deviationStatus === 'deviation';

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${
        isDeviation ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      {/* Header: street + badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
          {streetLabels[street]}
        </span>
        <DeviationBadge status={deviationStatus} />
      </div>

      {/* Action comparison */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* User action */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-1 text-xs font-medium text-gray-400">你的操作</div>
          <div className={`text-base font-bold ${actionColors[userAction]}`}>
            {formatAmount(userAction, displayAmount)}
          </div>
        </div>
        {/* GTO recommendation */}
        <div className={`rounded-lg p-3 ${isDeviation ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className="mb-1 text-xs font-medium text-gray-400">GTO 推荐</div>
          <div className={`text-base font-bold ${isDeviation ? 'text-green-700' : actionColors[gtoRecommendedAction]}`}>
            {formatAmount(gtoRecommendedAction, gtoRecommendedAmount)}
          </div>
        </div>
      </div>

      {/* Frequency bar */}
      {gtoActionFrequencies && gtoActionFrequencies.length > 0 && (
        <div className="mb-4">
          <FrequencyBar frequencies={gtoActionFrequencies} />
        </div>
      )}

      {/* Explanation */}
      <GtoExplanationText explanation={explanation} />
    </div>
  );
}