import React from 'react';

interface CheckButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CheckButton: React.FC<CheckButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150
        ${disabled
          ? 'bg-emerald-900/30 text-emerald-800 border border-emerald-900/50 cursor-not-allowed'
          : 'bg-emerald-900/50 text-emerald-400 border border-emerald-700 hover:bg-emerald-800/60 hover:text-emerald-300 active:scale-95'
        }
      `}
    >
      过牌
    </button>
  );
};