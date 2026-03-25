import React from 'react';

interface NextDecisionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const NextDecisionButton: React.FC<NextDecisionButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ${
        disabled
          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
      }`}
    >
      <span>Next Decision</span>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default NextDecisionButton;