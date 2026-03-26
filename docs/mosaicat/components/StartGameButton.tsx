import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => (
  <svg
    className={`animate-spin h-5 w-5 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export interface StartGameButtonProps {
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  disabled,
  loading = false,
  onClick,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative w-full max-w-xs mx-auto flex items-center justify-center gap-2
        px-8 py-4 text-lg font-semibold text-white
        rounded-xl shadow-md
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          isInteractive
            ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
        }
      `}
      aria-busy={loading}
      aria-label={loading ? '正在开始牌局…' : '开始牌局'}
    >
      {loading && <LoadingSpinner className="text-white" />}
      <span>{loading ? '正在开始…' : '开始牌局'}</span>
    </button>
  );
};

export default StartGameButton;