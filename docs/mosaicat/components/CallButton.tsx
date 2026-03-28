import React from 'react';

interface CallButtonProps {
  amount: number;
  onClick: () => void;
  disabled?: boolean;
}

export const CallButton: React.FC<CallButtonProps> = ({ amount, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150
        ${disabled
          ? 'bg-amber-500/10 text-amber-800 border border-amber-900/50 cursor-not-allowed'
          : 'bg-amber-500 text-gray-950 border border-amber-400 hover:bg-amber-400 active:scale-95'
        }
      `}
    >
      跟注 {amount.toLocaleString()}
    </button>
  );
};