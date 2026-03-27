import React from 'react';

interface BotActionLabelProps {
  action: string;
  amount?: number;
  className?: string;
}

export const BotActionLabel: React.FC<BotActionLabelProps> = ({
  action,
  amount,
  className = '',
}) => {
  const actionLower = action.toLowerCase();

  const colorMap: Record<string, string> = {
    raise: 'bg-red-500/20 border-red-500/40 text-red-400',
    bet: 'bg-red-500/20 border-red-500/40 text-red-400',
    call: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    check: 'bg-sky-500/20 border-sky-500/40 text-sky-400',
    fold: 'bg-gray-500/20 border-gray-600/40 text-gray-400',
    'all-in': 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  };

  const colors = colorMap[actionLower] ?? 'bg-gray-500/20 border-gray-600/40 text-gray-400';

  const displayText = amount != null ? `${action} to ${amount}` : action;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-lg border text-sm font-semibold ${colors} ${className}`}
    >
      {displayText}
    </div>
  );
};