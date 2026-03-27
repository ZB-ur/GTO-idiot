import React from 'react';

interface SpinnerButtonProps {
  label: string;
  loading: boolean;
  loadingLabel?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const SpinnerButton: React.FC<SpinnerButtonProps> = ({
  label,
  loading,
  loadingLabel,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  const isDisabled = disabled || loading;

  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses =
    variant === 'primary'
      ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400'
      : 'bg-gray-800 text-gray-50 border border-gray-700 hover:bg-gray-700';

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading ? (loadingLabel ?? label) : label}
    </button>
  );
};