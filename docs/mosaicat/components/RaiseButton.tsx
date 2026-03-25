import React from 'react';

interface RaiseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  expanded?: boolean;
}

const RaiseButton: React.FC<RaiseButtonProps> = ({ onClick, disabled = false, expanded = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-6 rounded-lg font-semibold text-base
        transition-all duration-150 ease-in-out
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : expanded
            ? 'bg-amber-600 text-white ring-2 ring-amber-300 shadow-md'
            : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.97] shadow-sm hover:shadow-md'
        }
      `}
      aria-expanded={expanded}
    >
      <span className="flex items-center justify-center gap-1.5">
        加注
        <svg
          className={`w-4 h-4 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
  );
};

export default RaiseButton;