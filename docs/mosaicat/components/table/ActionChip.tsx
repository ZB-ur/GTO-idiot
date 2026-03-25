import React from 'react';

type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'allin';

interface ActionChipProps {
  action: string;
  type: ActionType;
}

const actionStyles: Record<ActionType, string> = {
  fold: 'bg-gray-700/80 text-gray-300 border-gray-600/50',
  check: 'bg-emerald-700/80 text-emerald-200 border-emerald-600/50',
  call: 'bg-sky-700/80 text-sky-200 border-sky-600/50',
  raise: 'bg-amber-600/80 text-amber-100 border-amber-500/50',
  allin: 'bg-red-600/80 text-red-100 border-red-500/50',
};

const ActionChip: React.FC<ActionChipProps> = ({ action, type }) => {
  return (
    <div
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${actionStyles[type]}`}
    >
      {action}
    </div>
  );
};

export default ActionChip;