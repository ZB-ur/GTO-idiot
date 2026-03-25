import React from 'react';

type GtoRating = 'green' | 'yellow' | 'red' | 'gray';
type BadgeSize = 'sm' | 'md' | 'lg';

interface GtoColorBadgeProps {
  rating: GtoRating;
  size?: BadgeSize;
}

const ratingColors: Record<GtoRating, { bg: string; ring: string; glow: string }> = {
  green: {
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-400/30',
    glow: 'shadow-emerald-500/40',
  },
  yellow: {
    bg: 'bg-amber-400',
    ring: 'ring-amber-300/30',
    glow: 'shadow-amber-400/40',
  },
  red: {
    bg: 'bg-red-500',
    ring: 'ring-red-400/30',
    glow: 'shadow-red-500/40',
  },
  gray: {
    bg: 'bg-gray-500',
    ring: 'ring-gray-400/20',
    glow: 'shadow-gray-500/20',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export const GtoColorBadge: React.FC<GtoColorBadgeProps> = ({
  rating,
  size = 'md',
}) => {
  const colors = ratingColors[rating];

  return (
    <span
      className={`
        inline-block rounded-full
        ${sizeClasses[size]}
        ${colors.bg}
        ring-2 ${colors.ring}
        shadow-md ${colors.glow}
      `}
      role="img"
      aria-label={`GTO rating: ${rating}`}
    />
  );
};

export default GtoColorBadge;