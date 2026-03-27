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
        flex items-center justify-center
        px-6 py-3 min-w-[100px]
        bg-gray-800 hover:bg-gray-700
        border border-gray-700 hover:border-gray-600
        disabled:bg-gray-800 disabled:border-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed
        text-gray-50 font-bold
        rounded-xl
        transition-colors duration-150
        active:scale-95
      `}
    >
      <span class="text-sm font-semibold uppercase tracking-wide">Check</span>
    </button>
  );
};