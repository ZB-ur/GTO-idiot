import React from 'react';

interface PotDisplayProps {
  amount: number;
  className?: string;
}

const formatChips = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
};

const PotDisplay: React.FC<PotDisplayProps> = ({ amount, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-gray-900/70 px-4 py-1.5 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-900 shadow-inner">
        $
      </div>
      <span className="text-sm font-bold text-white">
        {formatChips(amount)}
      </span>
    </div>
  );
};

export default PotDisplay;