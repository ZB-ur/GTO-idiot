import React from 'react';

interface HandResultBannerProps {
  profit: number;
  isVisible: boolean;
}

const HandResultBanner: React.FC<HandResultBannerProps> = ({ profit, isVisible }) => {
  if (!isVisible) return null;

  const isPositive = profit >= 0;
  const displayText = isPositive ? `+${profit}` : `${profit}`;

  return (
    <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`
          rounded-xl px-8 py-4 backdrop-blur-md border
          ${isPositive
            ? 'bg-emerald-900/80 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.3)]'
            : 'bg-red-900/80 border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.3)]'
          }
          animate-bounce
        `}
      >
        <span
          className={`text-3xl font-black tracking-tight ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {displayText} chips
        </span>
      </div>
    </div>
  );
};

export default HandResultBanner;