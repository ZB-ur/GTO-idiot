import React from 'react';

export interface ResultBadgeProps {
  resultBB: number;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({ resultBB }) => {
  const isPositive = resultBB > 0;
  const isNegative = resultBB < 0;
  const isZero = resultBB === 0;

  const colorClasses = isPositive
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : isNegative
      ? 'bg-red-500/15 text-red-400 border-red-500/30'
      : 'bg-gray-500/15 text-gray-400 border-gray-500/30';

  const sign = isPositive ? '+' : isZero ? '±' : '';
  const display = `${sign}${resultBB} BB`;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border text-sm px-3 py-1 ${colorClasses}`}
    >
      {display}
    </span>
  );
};

export default ResultBadge;