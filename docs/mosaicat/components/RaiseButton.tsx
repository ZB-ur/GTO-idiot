import React from 'react';

interface RaiseButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RaiseButton: React.FC<RaiseButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        w-full px-6 py-3
        bg-amber-500 hover:bg-amber-400
        disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        text-gray-950 font-semibold
        rounded-xl
        transition-all duration-150
        active:scale-95
        shadow-md
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-base uppercase tracking-wide font-bold">Raise</span>
    </button>
  );
};

export default RaiseButton;