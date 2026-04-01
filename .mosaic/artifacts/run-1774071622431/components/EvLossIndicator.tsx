import React from 'react';

interface EvLossIndicatorProps {
  evLoss: number;
  unit?: string;
}

export const EvLossIndicator: React.FC<EvLossIndicatorProps> = ({
  evLoss,
  unit = 'BB',
}) => {
  const isZero = evLoss === 0;
  const colorClass = isZero
    ? 'text-emerald-600'
    : evLoss <= 1
      ? 'text-amber-600'
      : 'text-red-600';

  const bgClass = isZero
    ? 'bg-emerald-50'
    : evLoss <= 1
      ? 'bg-amber-50'
      : 'bg-red-50';

  const formatted = isZero ? '0.00' : `-${evLoss.toFixed(2)}`;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${bgClass}`}>
      <span className={`text-sm font-mono font-bold ${colorClass}`}>
        {formatted}
      </span>
      <span className={`text-xs font-medium ${colorClass} opacity-70`}>
        {unit}
      </span>
    </div>
  );
};

export default EvLossIndicator;