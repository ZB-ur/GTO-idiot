import React from 'react';

interface PFRBarProps {
  percentage: number;
}

export const PFRBar: React.FC<PFRBarProps> = ({ percentage }) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  // Color coding: <12 passive (sky), 12-20 normal (emerald), >20 aggressive (amber), >30 hyper-aggressive (red)
  const getColor = (pct: number): string => {
    if (pct < 12) return 'bg-sky-500';
    if (pct <= 20) return 'bg-emerald-500';
    if (pct <= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PFR</span>
        <span className="text-sm font-bold text-gray-900">{clampedPct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getColor(clampedPct)}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
};

export default PFRBar;