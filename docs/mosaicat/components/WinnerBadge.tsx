import React from 'react';

interface WinnerBadgeProps {
  handDescription: string;
  amount: number;
  className?: string;
}

export const WinnerBadge: React.FC<WinnerBadgeProps> = ({
  handDescription,
  amount,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 ${className}`}
    >
      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
        {handDescription}
      </span>
      <span className="text-sm font-bold text-amber-400">
        +{amount}
      </span>
    </div>
  );
};