import React from 'react';

interface FoldButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const FoldButton: React.FC<FoldButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150
        ${disabled
          ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
          : 'bg-gray-800 text-gray-50 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 active:scale-95'
        }
      `}
    >
      弃牌
    </button>
  );
};