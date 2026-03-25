import React from 'react';

interface PrevDecisionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const PrevDecisionButton: React.FC<PrevDecisionButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ${
        disabled
          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200 shadow-sm'
      }`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Previous Decision</span>
    </button>
  );
};

export default PrevDecisionButton;