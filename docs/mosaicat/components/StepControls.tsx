import React from 'react';

interface StepControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const StepControls: React.FC<StepControlsProps> = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-colors ${
          hasPrevious
            ? 'bg-gray-800 border-gray-700 text-gray-50 hover:bg-gray-700 hover:border-gray-600'
            : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        aria-label="上一步"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-colors ${
          hasNext
            ? 'bg-amber-500 border-amber-500 text-gray-950 hover:bg-amber-400'
            : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
        }`}
        aria-label="下一步"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};