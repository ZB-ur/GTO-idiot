import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div
      className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center select-none"
      aria-label="Dealer"
    >
      <span className="text-xs font-black text-gray-900 tracking-tight">D</span>
    </div>
  );
};

export default DealerButton;