/**
 * GTOComparisonBadge — colored badge indicating GTO deviation level.
 */

import React from 'react';
import type { DeviationLevel, OverallConformance } from '../../types/review';

interface GTOComparisonBadgeProps {
  level: DeviationLevel | OverallConformance;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  conforming: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'GTO' },
  minor: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Minor' },
  minor_deviation: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Minor' },
  major: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Major' },
  major_deviation: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Major' },
};

export const GTOComparisonBadge: React.FC<GTOComparisonBadgeProps> = ({
  level,
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const config = BADGE_CONFIG[level] ?? BADGE_CONFIG.conforming;
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium
        ${config.bg} ${config.text} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {showLabel && config.label}
    </span>
  );
};

export default GTOComparisonBadge;
