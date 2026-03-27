import React from 'react';

export interface HandNumberBadgeProps {
  handNumber: number;
  className?: string;
}

export const HandNumberBadge: React.FC<HandNumberBadgeProps> = ({ handNumber, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-800/70 border border-gray-700/50 ${className}`}
    >
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
        Hand
      </span>
      <span className="text-xs font-mono font-semibold text-gray-300">
        #{handNumber}
      </span>
    </div>
  );
};

export default HandNumberBadge;