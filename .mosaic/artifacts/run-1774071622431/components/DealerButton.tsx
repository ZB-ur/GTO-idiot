import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 border-2 border-yellow-600 shadow-md flex items-center justify-center select-none">
      <span className="text-xs font-extrabold text-yellow-900 leading-none">D</span>
    </div>
  );
};

export default DealerButton;