import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-7 h-7 rounded-full bg-white text-gray-950 font-bold text-xs flex items-center justify-center shadow-md border-2 border-gray-300 select-none ${className}`}
    >
      D
    </div>
  );
};