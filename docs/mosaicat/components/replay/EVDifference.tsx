import React from 'react';

export interface EVDifferenceProps {
  value: number | null;
  isEstimated?: boolean;
}

export const EVDifference: React.FC<EVDifferenceProps> = ({
  value,
  isEstimated = false,
}) => {
  if (value == null) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
        <span className="text-sm text-gray-500">EV差异: 数据不足</span>
      </div>
    );
  }

  const isPositive = value > 0;
  const isZero = value === 0;
  const colorClass = isZero
    ? 'text-gray-400'
    : isPositive
      ? 'text-emerald-500'
      : 'text-red-500';
  const sign = isPositive ? '+' : '';
  const bgClass = isZero
    ? 'border-gray-800'
    : isPositive
      ? 'border-emerald-500/30'
      : 'border-red-500/30';

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border ${bgClass}`}
    >
      <span className="text-sm text-gray-400">
        {isEstimated ? '估算' : ''}EV差异:
      </span>
      <span className={`text-sm font-bold font-mono ${colorClass}`}>
        {sign}{value.toFixed(2)} BB
      </span>
      {isEstimated && (
        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full font-medium">
          估算
        </span>
      )}
    </div>
  );
};