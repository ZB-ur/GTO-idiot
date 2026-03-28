import React from 'react';

interface BetRaiseButtonProps {
  label: 'Bet' | 'Raise';
  onClick: () => void;
  disabled?: boolean;
}

export const BetRaiseButton: React.FC<BetRaiseButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150
        ${disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-amber-500 text-gray-950 hover:bg-amber-400 active:scale-95 cursor-pointer'
        }
      `}
    >
      {label}
    </button>
  );
};