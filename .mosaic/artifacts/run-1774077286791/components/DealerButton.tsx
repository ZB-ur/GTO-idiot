import React from 'react';

const DealerButton: React.FC = () => {
  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-md"
      title="Dealer"
    >
      <span className="text-sm font-bold text-yellow-900 select-none">D</span>
    </div>
  );
};

export default DealerButton;