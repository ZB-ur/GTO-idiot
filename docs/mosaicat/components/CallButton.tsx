import React from 'react';

interface CallButtonProps {
  amount: number;
  onClick: () => void;
  disabled?: boolean;
}

const CallButton: React.FC<CallButtonProps> = ({ amount, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center
        w-full px-6 py-3
        bg-emerald-500 hover:bg-emerald-400
        disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        text-gray-100 font-semibold
        rounded-xl
        transition-all duration-150
        active:scale-95
        shadow-md
      `}
    >
      <span className="text-sm uppercase tracking-wide">Call</span>
      <span className="text-lg font-bold">${amount.toLocaleString()}</span>
    </button>
  );
};

export default CallButton;