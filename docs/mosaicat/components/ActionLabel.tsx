import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

export interface ActionLabelProps {
  action: ActionType;
  amount?: number;
  className?: string;
}

const actionConfig: Record<ActionType, { label: string; color: string; bg: string }> = {
  fold: { label: 'Fold', color: 'text-gray-400', bg: 'bg-gray-800/80' },
  check: { label: 'Check', color: 'text-sky-400', bg: 'bg-sky-400/15' },
  call: { label: 'Call', color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
  bet: { label: 'Bet', color: 'text-amber-400', bg: 'bg-amber-400/15' },
  raise: { label: 'Raise', color: 'text-orange-400', bg: 'bg-orange-400/15' },
  'all-in': { label: 'All-In', color: 'text-red-400', bg: 'bg-red-400/15' },
};

const formatAmount = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return amount.toLocaleString();
};

export const ActionLabel: React.FC<ActionLabelProps> = ({ action, amount, className = '' }) => {
  const config = actionConfig[action];

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-700/50 backdrop-blur-sm ${config.bg} ${className}`}
    >
      <span className={`text-xs font-bold uppercase tracking-wide ${config.color}`}>
        {config.label}
      </span>
      {amount !== undefined && (
        <span className={`text-xs font-semibold ${config.color}`}>
          ${formatAmount(amount)}
        </span>
      )}
    </div>
  );
};

export default ActionLabel;