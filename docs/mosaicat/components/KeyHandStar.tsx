import React from 'react';

interface KeyHandStarProps {
  marked: boolean;
  reason?: 'big_pnl' | 'gto_deviation' | 'manual';
  onClick: () => void;
}

const REASON_COLORS: Record<string, string> = {
  big_pnl: 'text-emerald-400',
  gto_deviation: 'text-red-400',
  manual: 'text-amber-400',
};

export const KeyHandStar: React.FC<KeyHandStarProps> = ({
  marked,
  reason,
  onClick,
}) => {
  const colorClass = marked && reason
    ? REASON_COLORS[reason] ?? 'text-amber-400'
    : marked
      ? 'text-amber-400'
      : 'text-gray-600 hover:text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`p-1 transition-all duration-150 cursor-pointer ${colorClass}`}
      aria-label={marked ? 'Unmark key hand' : 'Mark as key hand'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={marked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
};