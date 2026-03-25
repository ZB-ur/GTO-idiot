import React from 'react';

interface DealerButtonProps {
  className?: string;
}

const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-white to-amber-50 text-xs font-black text-gray-900 shadow-md ${className}`}
    >
      D
    </div>
  );
};

export default DealerButton;