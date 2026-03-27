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
        flex flex-col items-center justify-center
        px-6 py-3 min-w-[100px]
        bg-amber-500 hover:bg-amber-400
        disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        text-gray-950 font-bold
        rounded-xl
        transition-colors duration-150
        active:scale-95
      `}
    >
      <span className="text-sm font-semibold uppercase tracking-wide">Call</span>
      <span className="text-lg font-bold">{amount}</span>
    </button>
  );
};