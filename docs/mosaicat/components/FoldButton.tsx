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
        inline-flex items-center justify-center gap-2
        px-6 py-3 min-w-[120px]
        rounded-lg font-semibold text-sm uppercase tracking-wide
        border transition-all duration-150
        ${
          disabled
            ? 'bg-gray-800/50 border-gray-700/50 text-gray-600 cursor-not-allowed'
            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-gray-100 active:scale-95'
        }
      `}
      aria-label="Fold"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="4" y1="4" x2="12" y2="12" />
        <line x1="12" y1="4" x2="4" y2="12" />
      </svg>
      Fold
    </button>
  );
};