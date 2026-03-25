import React from 'react';

interface VPIPBarProps {
  percentage: number;
}

export const VPIPBar: React.FC<VPIPBarProps> = ({ percentage }) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));

  // Color coding: <20 tight (blue), 20-30 normal (emerald), >30 loose (amber), >40 very loose (red)
  const getColor = (pct: number): string => {
    if (pct < 20) return 'bg-blue-500';
    if (pct <= 30) return 'bg-emerald-500';
    if (pct <= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">VPIP</span>
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

export default VPIPBar;