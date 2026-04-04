import React from 'react';

export type DeviationLevel = 'correct' | 'acceptable' | 'error';

export interface DeviationBadgeProps {
  level: DeviationLevel;
}

const config: Record<DeviationLevel, { icon: string; label: string; bg: string; text: string; border: string }> = {
  correct: {
    icon: '✓',
    label: 'Correct',
    bg: 'bg-green-400/15',
    text: 'text-green-400',
    border: 'border-green-400/30',
  },
  acceptable: {
    icon: '△',
    label: 'Acceptable',
    bg: 'bg-yellow-400/15',
    text: 'text-yellow-400',
    border: 'border-yellow-400/30',
  },
  error: {
    icon: '✗',
    label: 'Error',
    bg: 'bg-red-400/15',
    text: 'text-red-400',
    border: 'border-red-400/30',
  },
};

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({ level }) => {
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold
        border ${c.bg} ${c.text} ${c.border} select-none`}
    >
      <span className="text-base leading-none">{c.icon}</span>
      {c.label}
    </span>
  );
};

export default DeviationBadge;