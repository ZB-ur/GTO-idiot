import React from 'react';

interface DeviationBadgeProps {
  severity: 'good' | 'minor' | 'mistake' | 'blunder';
  className?: string;
}

const severityConfig = {
  good: {
    label: 'Good',
    bg: 'bg-emerald-400/15',
    text: 'text-emerald-400',
    ring: 'ring-emerald-400/30',
  },
  minor: {
    label: 'Minor',
    bg: 'bg-sky-400/15',
    text: 'text-sky-400',
    ring: 'ring-sky-400/30',
  },
  mistake: {
    label: 'Mistake',
    bg: 'bg-amber-400/15',
    text: 'text-amber-400',
    ring: 'ring-amber-400/30',
  },
  blunder: {
    label: 'Blunder',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
  },
} as const;

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({ severity, className = '' }) => {
  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default DeviationBadge;