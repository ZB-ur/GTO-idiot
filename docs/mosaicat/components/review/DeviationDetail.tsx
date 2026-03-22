import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
export type DeviationLevel = 'conforming' | 'minor' | 'major';

export interface GTOComparison {
  userAction: {
    actionType: ActionType;
    amount?: number;
  };
  gtoAction: {
    actionType: ActionType;
    amount?: number;
    sizing?: string;
  };
  deviationLevel: DeviationLevel;
  evLoss?: number;
  explanation?: string;
}

interface DeviationDetailProps {
  comparison: GTOComparison;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const actionLabels: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-In',
};

const deviationConfig: Record<DeviationLevel, { label: string; color: string; bg: string; border: string }> = {
  conforming: { label: 'GTO', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  minor: { label: 'Minor', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  major: { label: 'Major', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

function formatAmount(amount?: number): string {
  if (amount === undefined) return '';
  return ` ${amount.toFixed(1)}BB`;
}

export const DeviationDetail: React.FC<DeviationDetailProps> = ({
  comparison,
  isExpanded = false,
  onToggle,
}) => {
  const config = deviationConfig[comparison.deviationLevel];

  return (
    <div className={`border ${config.border} ${config.bg} rounded-lg overflow-hidden transition-all`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${config.color} ${config.bg} border ${config.border}`}>
            {config.label}
          </span>
          <span className="text-sm text-gray-900 font-medium">
            You: {actionLabels[comparison.userAction.actionType]}
            {formatAmount(comparison.userAction.amount)}
          </span>
          {comparison.deviationLevel !== 'conforming' && (
            <span className="text-sm text-gray-400">→</span>
          )}
          {comparison.deviationLevel !== 'conforming' && (
            <span className="text-sm text-blue-600 font-medium">
              GTO: {actionLabels[comparison.gtoAction.actionType]}
              {comparison.gtoAction.sizing ? ` ${comparison.gtoAction.sizing}` : formatAmount(comparison.gtoAction.amount)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {comparison.evLoss !== undefined && comparison.evLoss > 0 && (
            <span className="text-sm font-semibold text-red-600">
              −{comparison.evLoss.toFixed(1)}BB
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/60">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Your Action</p>
              <p className="text-sm font-semibold text-gray-900">
                {actionLabels[comparison.userAction.actionType]}
                {formatAmount(comparison.userAction.amount)}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">GTO Recommendation</p>
              <p className="text-sm font-semibold text-blue-600">
                {actionLabels[comparison.gtoAction.actionType]}
                {comparison.gtoAction.sizing ? ` ${comparison.gtoAction.sizing}` : formatAmount(comparison.gtoAction.amount)}
              </p>
            </div>
          </div>
          {comparison.explanation && (
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Explanation</p>
              <p className="text-sm text-gray-700">{comparison.explanation}</p>
            </div>
          )}
          {comparison.evLoss !== undefined && comparison.evLoss > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full"
                  style={{ width: `${Math.min(comparison.evLoss * 10, 100)}%` }}
                />
              </div>
              <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                EV Loss: {comparison.evLoss.toFixed(1)}BB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviationDetail;