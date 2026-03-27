import React from 'react';

interface PresetRaiseButtonProps {
  label: string;
  amount: number;
  onClick: (amount: number) => void;
}

const PresetRaiseButton: React.FC<PresetRaiseButtonProps> = ({ label, amount, onClick }) => {
  return (
    <button
      onClick={() => onClick(amount)}
      className={`
        flex flex-col items-center justify-center
        px-3 py-2
        bg-gray-800 hover:bg-gray-700
        border border-gray-700 hover:border-amber-500
        text-gray-100
        rounded-lg
        transition-all duration-150
        active:scale-95
        min-w-[72px]
      `}
    >
      <span className="text-xs text-amber-400 font-medium uppercase">{label}</span>
      <span className="text-sm font-bold text-gray-100">${amount.toLocaleString()}</span>
    </button>
  );
};

export default PresetRaiseButton;