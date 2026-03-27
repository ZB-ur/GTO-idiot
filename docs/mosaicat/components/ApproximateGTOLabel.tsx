import React from 'react';

export interface ApproximateGTOLabelProps {
  className?: string;
}

export const ApproximateGTOLabel: React.FC<ApproximateGTOLabelProps> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/60 border border-gray-700/50 ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-orange-400 flex-shrink-0"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2.5a1 1 0 110 2 1 1 0 010-2zM6.75 7h1.5v4.5h-1.5V7z" />
      </svg>
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
        Approximate GTO
      </span>
    </div>
  );
};

export default ApproximateGTOLabel;