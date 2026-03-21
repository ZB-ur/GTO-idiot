import React from 'react';

interface HintButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export const HintButton: React.FC<HintButtonProps> = ({
  disabled = false,
  loading = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-lg text-sm font-semibold
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-gray-950
        ${
          disabled || loading
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-400/50 active:scale-95'
        }
      `}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-emerald-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2a6 6 0 00-2.11 11.62c.18.07.31.26.31.46v1.42a.5.5 0 00.5.5h2.6a.5.5 0 00.5-.5v-1.42c0-.2.13-.39.31-.46A6 6 0 0010 2zm-1.3 15h2.6a.5.5 0 01.5.5v.5a1 1 0 01-1 1h-1.6a1 1 0 01-1-1v-.5a.5.5 0 01.5-.5z" />
        </svg>
      )}
      {loading ? 'GTO 计算中…' : 'GTO 提示'}
    </button>
  );
};

export default HintButton;