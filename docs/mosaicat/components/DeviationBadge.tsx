import React from 'react';

export type DeviationLevel = 'optimal' | 'slight' | 'significant' | 'no_data';

export interface DeviationBadgeProps {
  level: DeviationLevel;
  className?: string;
}

const LEVEL_CONFIG: Record<DeviationLevel, { label: string; bg: string; text: string; dot: string }> = {
  optimal: {
    label: '符合GTO',
    bg: 'bg-emerald-400/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  slight: {
    label: '轻微偏差',
    bg: 'bg-amber-400/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  significant: {
    label: '显著偏差',
    bg: 'bg-red-400/15',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  no_data: {
    label: '无数据',
    bg: 'bg-gray-700/50',
    text: 'text-gray-500',
    dot: 'bg-gray-500',
  },
};

export const DeviationBadge: React.FC<DeviationBadgeProps> = ({ level, className = '' }) => {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default DeviationBadge;