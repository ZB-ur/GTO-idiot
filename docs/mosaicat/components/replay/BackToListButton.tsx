import React from 'react';

interface BackToListButtonProps {
  onClick: () => void;
}

export const BackToListButton: React.FC<BackToListButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-gray-600 hover:bg-gray-800 hover:text-gray-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      返回列表
    </button>
  );
};

export default BackToListButton;