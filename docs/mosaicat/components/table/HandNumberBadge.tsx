import React from 'react';

interface HandNumberBadgeProps {
  handNumber: number;
}

const HandNumberBadge: React.FC<HandNumberBadgeProps> = ({ handNumber }) => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900/70 border border-emerald-700/40 px-2.5 py-1 backdrop-blur-sm">
      <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">
        Hand
      </span>
      <span className="text-xs font-bold text-emerald-200 tabular-nums">
        #{handNumber}
      </span>
    </div>
  );
};

export default HandNumberBadge;