import React from 'react';

interface ConfirmButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-2.5 px-5 rounded-lg font-semibold text-sm
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.97] shadow-sm hover:shadow-md'
        }
      `}
    >
      确认加注
    </button>
  );
};

export default ConfirmButton;