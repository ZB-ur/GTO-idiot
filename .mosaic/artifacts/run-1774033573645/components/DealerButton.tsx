import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        w-8 h-8 rounded-full
        bg-white border-2 border-gray-300
        shadow-md
        flex items-center justify-center
        text-sm font-bold text-gray-900
        select-none
        ${className}
      `}
    >
      D
    </div>
  );
};

export default DealerButton;