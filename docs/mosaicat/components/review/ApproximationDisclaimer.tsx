import React, { useState } from 'react';

interface ApproximationDisclaimerProps {
  comparisonType: 'preflop_range' | 'postflop_simplified';
  label: string;
}

const tooltipText: Record<string, string> = {
  preflop_range:
    'GTO ranges are based on simplified preflop charts and may not account for all table dynamics.',
  postflop_simplified:
    'Postflop analysis uses simplified decision trees and does not cover all possible game states.',
};

const ApproximationDisclaimer: React.FC<ApproximationDisclaimerProps> = ({
  comparisonType,
  label,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-medium">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <span>{label}</span>
        <button
          type="button"
          className="ml-0.5 text-sky-500 hover:text-sky-700 transition-colors"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          aria-label="More information"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 z-10 w-64 p-2.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-md">
          {tooltipText[comparisonType]}
        </div>
      )}
    </div>
  );
};

export default ApproximationDisclaimer;