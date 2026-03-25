import React from 'react';

interface CheckButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CheckButton: React.FC<CheckButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-6 rounded-lg font-semibold text-base
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.97] shadow-sm hover:shadow-md'
        }
      `}
    >
      过牌
    </button>
  );
};

export default CheckButton;