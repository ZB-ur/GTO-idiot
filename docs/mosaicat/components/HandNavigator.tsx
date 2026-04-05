import React from 'react';

export interface HandNavigatorProps {
  currentHandIndex: number;
  totalHands: number;
  onPreviousHand: () => void;
  onNextHand: () => void;
}

export function HandNavigator({
  currentHandIndex,
  totalHands,
  onPreviousHand,
  onNextHand,
}: HandNavigatorProps) {
  const isFirst = currentHandIndex <= 0;
  const isLast = currentHandIndex >= totalHands - 1;

  return (
    <div className="flex items-center gap-3">
      {/* Previous button */}
      <button
        onClick={onPreviousHand}
        disabled={isFirst}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
          border transition-all
          ${isFirst
            ? 'bg-gray-800/50 text-gray-600 border-gray-700/50 cursor-not-allowed'
            : 'bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 active:scale-95'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Previous
      </button>

      {/* Hand counter */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
        <span className="text-sm font-bold text-gray-50 tabular-nums">
          {currentHandIndex + 1}
        </span>
        <span className="text-sm text-gray-500">/</span>
        <span className="text-sm text-gray-400 tabular-nums">{totalHands}</span>
      </div>

      {/* Next button */}
      <button
        onClick={onNextHand}
        disabled={isLast}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
          border transition-all
          ${isLast
            ? 'bg-gray-800/50 text-gray-600 border-gray-700/50 cursor-not-allowed'
            : 'bg-gray-800 text-gray-50 border-gray-700 hover:bg-gray-700 hover:border-gray-600 active:scale-95'
          }
        `}
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}