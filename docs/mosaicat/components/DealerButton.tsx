import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-300/70 shadow-lg shadow-black/40 flex items-center justify-center select-none ${className}`}
    >
      <span className="text-xs font-extrabold text-gray-900 leading-none">D</span>
    </div>
  );
};