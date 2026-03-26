import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

interface ActionBadgeProps {
  action: ActionType;
  amount?: number;
}

const actionStyles: Record<ActionType, { bg: string; text: string; label: string }> = {
  fold: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Fold' },
  check: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Check' },
  call: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Call' },
  bet: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Bet' },
  raise: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Raise' },
  'all-in': { bg: 'bg-red-100', text: 'text-red-700', label: 'All-In' },
};

const formatAmount = (amount: number): string => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return amount.toString();
};

export const ActionBadge: React.FC<ActionBadgeProps> = ({ action, amount }) => {
  const style = actionStyles[action];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold shadow-sm ${style.bg} ${style.text}`}
    >
      {style.label}
      {amount !== undefined && <span className="font-bold">{formatAmount(amount)}</span>}
    </span>
  );
};

export default ActionBadge;