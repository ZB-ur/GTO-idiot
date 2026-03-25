import React from 'react';

export interface ChipCountBadgeProps {
  /** Chip amount to display */
  amount: number;
  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to animate on amount change */
  animate?: boolean;
}

const sizeConfig = {
  sm: {
    wrapper: 'px-1.5 py-0.5 gap-1 rounded-md',
    icon: 'w-3 h-3',
    text: 'text-xs font-medium',
  },
  md: {
    wrapper: 'px-2 py-1 gap-1.5 rounded-lg',
    icon: 'w-4 h-4',
    text: 'text-sm font-semibold',
  },
  lg: {
    wrapper: 'px-3 py-1.5 gap-2 rounded-lg',
    icon: 'w-5 h-5',
    text: 'text-base font-bold',
  },
} as const;

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

/** Poker chip SVG icon */
function ChipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="3" fill="#eab308" />
    </svg>
  );
}

export const ChipCountBadge: React.FC<ChipCountBadgeProps> = ({
  amount,
  size = 'md',
  animate = false,
}) => {
  const config = sizeConfig[size];

  return (
    <span
      className={`
        inline-flex items-center
        bg-gray-900/80 text-white backdrop-blur-sm
        ${config.wrapper}
        ${animate ? 'transition-all duration-300 ease-out' : ''}
      `}
      role="status"
      aria-label={`${amount} chips`}
    >
      <ChipIcon className={`${config.icon} flex-shrink-0`} />
      <span className={`${config.text} tabular-nums leading-none`}>
        {formatChips(amount)}
      </span>
    </span>
  );
};

export default ChipCountBadge;