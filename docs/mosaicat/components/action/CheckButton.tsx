import React from 'react';

interface CheckButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isAvailable: boolean;
}

const CheckButton: React.FC<CheckButtonProps> = ({ onClick, disabled = false, isAvailable }) => {
  const isDisabled = disabled || !isAvailable;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full px-6 py-3 rounded-xl font-semibold text-base
        transition-all duration-150 ease-in-out
        ${isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95 shadow-sm hover:shadow-md border border-gray-200'
        }
      `}
    >
      Check
    </button>
  );
};

export default CheckButton;