import React from 'react';

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  onGoToStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onGoToEnd: () => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentStep,
  totalSteps,
  onGoToStart,
  onPrev,
  onNext,
  onGoToEnd,
}) => {
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= totalSteps - 1;

  return (
    <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
      {/* Go to start */}
      <button
        onClick={onGoToStart}
        disabled={isAtStart}
        className="p-2 rounded-lg text-gray-100 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
        aria-label="跳到开始"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4v12M7 10l7-6v12l-7-6z" fill="currentColor" />
        </svg>
      </button>

      {/* Previous */}
      <button
        onClick={onPrev}
        disabled={isAtStart}
        className="p-2 rounded-lg text-gray-100 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
        aria-label="上一步"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4l-8 6 8 6V4z" fill="currentColor" />
        </svg>
      </button>

      {/* Step counter */}
      <span className="text-sm text-gray-400 font-mono min-w-[80px] text-center">
        {currentStep + 1} / {totalSteps}
      </span>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={isAtEnd}
        className="p-2 rounded-lg text-gray-100 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
        aria-label="下一步"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4l8 6-8 6V4z" fill="currentColor" />
        </svg>
      </button>

      {/* Go to end */}
      <button
        onClick={onGoToEnd}
        disabled={isAtEnd}
        className="p-2 rounded-lg text-gray-100 hover:bg-gray-700 disabled:text-gray-500 disabled:hover:bg-transparent transition-colors"
        aria-label="跳到结束"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4v12M13 10l-7-6v12l7-6z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};