import React from 'react';

interface NetResultDisplayProps {
  amount: number;
}

export const NetResultDisplay: React.FC<NetResultDisplayProps> = ({ amount }) => {
  const isPositive = amount >= 0;
  const isZero = amount === 0;
  const formattedAmount = `${isPositive && !isZero ? '+' : ''}${amount}`;

  const colorClass = isZero
    ? 'text-gray-400'
    : isPositive
      ? 'text-emerald-400'
      : 'text-red-400';

  const bgClass = isZero
    ? 'bg-gray-800/50'
    : isPositive
      ? 'bg-emerald-400/10'
      : 'bg-red-400/10';

  const borderClass = isZero
    ? 'border-gray-700'
    : isPositive
      ? 'border-emerald-400/20'
      : 'border-red-400/20';

  return (
    <div className={`${bgClass} border ${borderClass} rounded-xl p-6 flex flex-col items-center gap-1`}>
      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
        Net Result
      </span>
      <span className={`text-4xl font-bold ${colorClass}`}>
        {formattedAmount}
      </span>
      <span className="text-sm text-gray-500">chips</span>
    </div>
  );
};