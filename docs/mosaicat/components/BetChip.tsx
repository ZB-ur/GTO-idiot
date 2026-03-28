import React from 'react';

interface BetChipProps {
  amount: number;
  className?: string;
}

export const BetChip: React.FC<BetChipProps> = ({ amount, className = '' }) => {
  const formatAmount = (val: number): string => {
    if (val >= 1000) return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return val.toString();
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-amber-300 shadow-sm flex-shrink-0" />
      <span className="text-sm font-semibold text-gray-50 tabular-nums">
        {formatAmount(amount)}
      </span>
    </div>
  );
};