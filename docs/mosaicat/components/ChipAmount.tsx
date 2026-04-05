import React from 'react';

interface ChipAmountProps {
  amount: number;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { text: 'text-xs', icon: 'w-3 h-3' },
  md: { text: 'text-sm', icon: 'w-4 h-4' },
  lg: { text: 'text-lg', icon: 'w-5 h-5' },
};

function formatChips(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}K`;
  return abs.toLocaleString();
}

export const ChipAmount: React.FC<ChipAmountProps> = ({
  amount,
  showSign = false,
  size = 'md',
}) => {
  const s = sizeMap[size];
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  let colorClass = 'text-gray-50';
  let sign = '';
  if (showSign && isPositive) {
    colorClass = 'text-emerald-400';
    sign = '+';
  } else if (showSign && isNegative) {
    colorClass = 'text-red-400';
    sign = '-';
  }

  return (
    <span className={`inline-flex items-center gap-1 ${colorClass} ${s.text} font-semibold`}>
      <svg
        className={`${s.icon} flex-shrink-0`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">$</text>
      </svg>
      <span>{sign}{formatChips(Math.abs(amount))}</span>
    </span>
  );
};

export default ChipAmount;