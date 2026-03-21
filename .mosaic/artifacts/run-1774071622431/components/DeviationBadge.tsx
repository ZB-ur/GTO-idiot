import React from 'react';

interface DeviationBadgeProps {
  level: 'match' | 'minor_deviation' | 'major_deviation';
}

const badgeConfig: Record<
  DeviationBadgeProps['level'],
  { label: string; bg: string; text: string; dot: string }
> = {
  match: {
    label: 'GTO Match',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  minor_deviation: {
    label: 'Minor Deviation',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  major_deviation: {
    label: 'Major Deviation',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({ level }) => {
  const config = badgeConfig[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default DeviationBadge;