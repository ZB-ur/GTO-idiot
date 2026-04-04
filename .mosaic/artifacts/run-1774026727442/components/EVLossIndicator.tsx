import React from 'react';

export interface EVLossIndicatorProps {
  evLoss: number;
}

export const EVLossIndicator: React.FC<EVLossIndicatorProps> = ({ evLoss }) => {
  const isZero = evLoss === 0;
  const formatted = isZero ? '0.00' : evLoss.toFixed(2);
  const sign = isZero ? '' : '-';

  const colorClass = isZero
    ? 'text-green-400'
    : evLoss <= 0.5
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm font-semibold ${colorClass} select-none`}>
      <span className="text-xs opacity-70">EV</span>
      <span>{sign}{formatted}</span>
      <span className="text-xs opacity-70">BB</span>
    </span>
  );
};

export default EVLossIndicator;