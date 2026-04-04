import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div
      className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500
        border-2 border-amber-600 shadow-md
        flex items-center justify-center
        text-gray-900 font-bold text-sm select-none"
    >
      D
    </div>
  );
};

export default DealerButton;