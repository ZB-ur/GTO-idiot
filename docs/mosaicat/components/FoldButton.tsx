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
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-lg text-base font-semibold
        transition-all duration-150
        ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md'
        }
      `}
      aria-label="弃牌"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 14l8-8M6 6l8 8" />
      </svg>
      <span>弃牌</span>
    </button>
  );
};

export default FoldButton;