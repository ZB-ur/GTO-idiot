import React from 'react';

export interface RatingBadgeProps {
  rating: 'optimal' | 'acceptable' | 'error';
  size?: 'sm' | 'md';
}

const RATING_CONFIG = {
  optimal: {
    icon: '✅',
    label: '最优',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  acceptable: {
    icon: '⚠️',
    label: '可接受',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  error: {
    icon: '❌',
    label: '错误',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};

const SIZE_MAP = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
};

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = 'md',
}) => {
  const config = RATING_CONFIG[rating];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${SIZE_MAP[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default RatingBadge;