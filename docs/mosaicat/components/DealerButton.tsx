import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div
      className="
        w-8 h-8 rounded-full
        bg-gradient-to-br from-white to-gray-200
        border-2 border-gray-300
        shadow-lg shadow-black/30
        flex items-center justify-center
        select-none
      "
    >
      <span className="text-gray-900 text-xs font-black tracking-tight">D</span>
    </div>
  );
};

export default DealerButton;