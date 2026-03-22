/**
 * DealerButton — small circular dealer chip indicator.
 */

import React from 'react';

interface DealerButtonProps {
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-6 h-6 rounded-full bg-white border-2 border-gray-400
        flex items-center justify-center shadow-md
        text-[0.6rem] font-bold text-gray-800 select-none
        ${className}`}
    >
      D
    </div>
  );
};

export default DealerButton;
