import React from 'react';

interface HandResultBannerProps {
  netResult: number;
  visible: boolean;
}

export const HandResultBanner: React.FC<HandResultBannerProps> = ({
  netResult,
  visible,
}) => {
  if (!visible) return null;

  const isPositive = netResult > 0;
  const isZero = netResult === 0;

  const sign = isPositive ? '+' : '';
  const text = `${sign}${netResult}BB`;

  const colorClasses = isZero
    ? 'text-gray-400 bg-gray-800/80 border-gray-600'
    : isPositive
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-700/50'
      : 'text-red-400 bg-red-950/80 border-red-700/50';

  const glowClass = isZero
    ? ''
    : isPositive
      ? 'shadow-emerald-500/20'
      : 'shadow-red-500/20';

  return (
    <div
      className={`inline-flex items-center justify-center px-6 py-2 rounded-full border backdrop-blur-sm font-bold text-2xl tabular-nums tracking-tight shadow-lg transition-all duration-500 ${colorClasses} ${glowClass}`}
    >
      {text}
    </div>
  );
};

export default HandResultBanner;