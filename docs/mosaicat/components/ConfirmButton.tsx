import React from 'react';

interface ConfirmButtonProps {
  amount: number;
  onClick: () => void;
  disabled?: boolean;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  amount,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3 rounded-xl font-bold text-base transition-all duration-150
        ${disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-emerald-500 text-gray-950 hover:bg-emerald-400 active:scale-95 cursor-pointer'
        }
      `}
    >
      Confirm {amount}
    </button>
  );
};