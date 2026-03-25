import React from 'react';

interface ConfirmButtonProps {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  label,
  disabled = false,
  loading = false,
  onClick,
}) => {
  const isInactive = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isInactive}
      className={`
        bg-emerald-500 text-white border border-emerald-400
        ${isInactive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-400 cursor-pointer active:scale-95'}
        rounded-lg px-8 py-3 font-bold text-base
        transition-all duration-150 select-none
        flex items-center justify-center gap-2 min-w-[120px]
        shadow-md shadow-emerald-500/20
      `}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
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
      )}
      <span>{loading ? 'Confirming...' : label}</span>
    </button>
  );
};

export default ConfirmButton;