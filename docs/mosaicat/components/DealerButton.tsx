import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div
      className="
        w-8 h-8 rounded-full
        bg-gradient-to-b from-white to-gray-100
        border-2 border-gray-300
        shadow-md
        flex items-center justify-center
        select-none
      "
    >
      <span className="text-xs font-extrabold text-gray-900 tracking-tight">
        D
      </span>
    </div>
  );
};

export default DealerButton;