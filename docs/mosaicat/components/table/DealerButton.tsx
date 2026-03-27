import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        flex items-center justify-center
        w-7 h-7
        bg-amber-500 text-gray-950
        rounded-full
        text-xs font-extrabold
        shadow-md
        border-2 border-amber-400
        select-none
        ${className}
      `}
    >
      D
    </div>
  );
};