import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        w-7 h-7 rounded-full
        bg-white border-2 border-gray-300
        shadow-sm
        text-xs font-bold text-gray-900
        select-none
        ${className}
      `}
    >
      D
    </div>
  );
};