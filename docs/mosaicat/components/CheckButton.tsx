import React from 'react';

interface CheckButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CheckButton: React.FC<CheckButtonProps> = ({ onClick, disabled = false }) => {
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
            ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-700 cursor-not-allowed'
            : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95'
        }
      `}
      aria-label="Check"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3,8 7,12 13,4" />
      </svg>
      Check
    </button>
  );
};