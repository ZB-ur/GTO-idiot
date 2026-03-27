import React from 'react';

interface FoldButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const FoldButton: React.FC<FoldButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 text-sm font-semibold rounded-lg border transition-colors
        ${
          disabled
            ? 'bg-gray-800/50 text-gray-500 border-gray-700/50 cursor-not-allowed'
            : 'bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 active:bg-gray-600'
        }
      `}
    >
      Fold
    </button>
  );
};

export default FoldButton;