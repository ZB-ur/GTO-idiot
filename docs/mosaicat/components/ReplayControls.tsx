import React from 'react';

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentStep,
  totalSteps,
  onStart,
  onPrev,
  onNext,
  onEnd,
}) => {
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= totalSteps - 1;
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const buttonBase =
    'flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50';
  const buttonEnabled =
    'bg-gray-800 text-gray-50 hover:bg-gray-700 active:bg-gray-600';
  const buttonDisabled = 'bg-gray-800/50 text-gray-600 cursor-not-allowed';

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1 w-full rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Start button */}
        <button
          onClick={onStart}
          disabled={isAtStart}
          className={`${buttonBase} ${isAtStart ? buttonDisabled : buttonEnabled}`}
          aria-label="Go to start"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="3" width="2" height="10" rx="0.5" />
            <path d="M13 3.5L7 8l6 4.5V3.5z" />
          </svg>
        </button>

        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={isAtStart}
          className={`${buttonBase} ${isAtStart ? buttonDisabled : buttonEnabled}`}
          aria-label="Previous step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 3.5L5 8l6 4.5V3.5z" />
          </svg>
        </button>

        {/* Step counter */}
        <div className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 min-w-[80px] text-center">
          <span className="text-sm font-mono text-amber-400 font-semibold">
            {currentStep + 1}
          </span>
          <span className="text-sm font-mono text-gray-500"> / {totalSteps}</span>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={isAtEnd}
          className={`${buttonBase} ${isAtEnd ? buttonDisabled : buttonEnabled}`}
          aria-label="Next step"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 3.5L11 8l-6 4.5V3.5z" />
          </svg>
        </button>

        {/* End button */}
        <button
          onClick={onEnd}
          disabled={isAtEnd}
          className={`${buttonBase} ${isAtEnd ? buttonDisabled : buttonEnabled}`}
          aria-label="Go to end"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 3.5L9 8l-6 4.5V3.5z" />
            <rect x="12" y="3" width="2" height="10" rx="0.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};