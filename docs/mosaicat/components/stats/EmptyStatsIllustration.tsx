import React from 'react';

interface EmptyStatsIllustrationProps {
  onAction: () => void;
}

const EmptyStatsIllustration: React.FC<EmptyStatsIllustrationProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration: empty chart */}
      <div className="mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-gray-200"
          fill="none"
          viewBox="0 0 80 80"
        >
          {/* Grid lines */}
          <line x1="16" y1="16" x2="16" y2="64" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="64" x2="68" y2="64" stroke="currentColor" strokeWidth="1.5" />
          {/* Dashed placeholder bars */}
          <rect x="24" y="44" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <rect x="36" y="34" width="8" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <rect x="48" y="24" width="8" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">No stats available</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Complete your first session to unlock performance statistics and GTO analysis.
      </p>

      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm transition-colors hover:bg-blue-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Start a Session
      </button>
    </div>
  );
};

export default EmptyStatsIllustration;