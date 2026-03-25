import React from 'react';

interface CallButtonProps {
  amount: number;
  onClick: () => void;
  disabled?: boolean;
  isAvailable: boolean;
}

const CallButton: React.FC<CallButtonProps> = ({ amount, onClick, disabled = false, isAvailable }) => {
  const isDisabled = disabled || !isAvailable;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full px-6 py-3 rounded-xl font-semibold text-base text-white
        transition-all duration-150 ease-in-out
        ${isDisabled
          ? 'bg-blue-300 cursor-not-allowed opacity-60'
          : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md'
        }
      `}
    >
      Call {amount.toLocaleString()}
    </button>
  );
};

export default CallButton;