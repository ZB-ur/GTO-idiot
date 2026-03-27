import React from 'react';

interface ActionLabelProps {
  action: string;
  amount?: number;
  visible: boolean;
}

const ACTION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  fold:    { bg: 'bg-gray-600/80', text: 'text-gray-300', border: 'border-gray-500/50' },
  check:   { bg: 'bg-emerald-600/80', text: 'text-emerald-100', border: 'border-emerald-400/50' },
  call:    { bg: 'bg-sky-600/80', text: 'text-sky-100', border: 'border-sky-400/50' },
  bet:     { bg: 'bg-amber-600/80', text: 'text-amber-100', border: 'border-amber-400/50' },
  raise:   { bg: 'bg-orange-600/80', text: 'text-orange-100', border: 'border-orange-400/50' },
  allin:   { bg: 'bg-red-600/80', text: 'text-red-100', border: 'border-red-400/50' },
};

const getActionStyle = (action: string) => {
  const key = action.toLowerCase().replace(/[\s-]/g, '');
  if (key.includes('allin') || key.includes('all-in')) return ACTION_STYLES.allin;
  if (key.includes('raise')) return ACTION_STYLES.raise;
  if (key.includes('bet')) return ACTION_STYLES.bet;
  if (key.includes('call')) return ACTION_STYLES.call;
  if (key.includes('check')) return ACTION_STYLES.check;
  if (key.includes('fold')) return ACTION_STYLES.fold;
  return ACTION_STYLES.bet; // default
};

export const ActionLabel: React.FC<ActionLabelProps> = ({ action, amount, visible }) => {
  const style = getActionStyle(action);

  const displayText = amount !== undefined ? `${action} ${amount}BB` : action;

  return (
    <div
      className={`
        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
        border backdrop-blur-sm shadow-lg
        transition-all duration-300 ease-in-out
        ${style.bg} ${style.text} ${style.border}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}
    >
      {displayText}
    </div>
  );
};

export default ActionLabel;