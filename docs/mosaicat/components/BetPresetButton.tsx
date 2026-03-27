import React from 'react';

interface BetPresetButtonProps {
  label: string;
  amount: number;
  onClick: (amount: number) => void;
  disabled?: boolean;
}

export const BetPresetButton: React.FC<BetPresetButtonProps> = ({
  label,
  amount,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(amount)}
      disabled={disabled}
      className={`
        px-3 py-2 text-sm font-semibold rounded-xl border transition-all duration-150
        ${disabled
          ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
          : 'bg-gray-800 text-gray-50 border-gray-700 hover:bg-emerald-500 hover:border-emerald-400 hover:text-gray-950 active:scale-95'
        }
      `}
    >
      {label}
    </button>
  );
};

export default BetPresetButton;