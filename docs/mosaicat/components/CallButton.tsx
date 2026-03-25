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
        w-full py-3 px-6 rounded-lg font-semibold text-base
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97] shadow-sm hover:shadow-md'
        }
      `}
    >
      <span className="block text-base">跟注</span>
      <span className="block text-sm font-normal opacity-90">{amount}</span>
    </button>
  );
};

export default CallButton;