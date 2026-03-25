import React from 'react';

interface FoldButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FoldButton: React.FC<FoldButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3 rounded-xl font-semibold text-base text-white
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-red-300 cursor-not-allowed opacity-60'
          : 'bg-red-500 hover:bg-red-600 active:scale-95 shadow-sm hover:shadow-md'
        }
      `}
    >
      Fold
    </button>
  );
};

export default FoldButton;