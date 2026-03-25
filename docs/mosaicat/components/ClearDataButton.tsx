import React, { useState } from 'react';

interface ClearDataButtonProps {
  onClick: () => void;
}

export const ClearDataButton: React.FC<ClearDataButtonProps> = ({ onClick }) => {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onClick();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-red-500/50
        ${confirming
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
        }
      `}
    >
      {confirming ? 'Tap again to confirm' : 'Clear All Data'}
    </button>
  );
};

export default ClearDataButton;