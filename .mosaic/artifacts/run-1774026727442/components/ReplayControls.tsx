import React, { useCallback, useEffect } from 'react';

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
}

const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPrev,
  onNext,
  onPlay,
  onPause,
}) => {
  const isFirst = currentStep <= 0;
  const isLast = currentStep >= totalSteps - 1;
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (!isFirst) onPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isLast) onNext();
          break;
        case ' ':
          e.preventDefault();
          isPlaying ? onPause() : onPlay();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirst, isLast, isPlaying, onPrev, onNext, onPlay, onPause]);

  const handlePlayPause = useCallback(() => {
    isPlaying ? onPause() : onPlay();
  }, [isPlaying, onPlay, onPause]);

  return (
    <div className="w-full bg-gray-800 border border-gray-600 rounded-xl p-4 space-y-3">
      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Step dots */}
        {totalSteps <= 20 && (
          <div className="absolute inset-0 flex items-center justify-between px-0">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-emerald-400' : 'bg-gray-600'
                } ${i === currentStep ? 'ring-2 ring-emerald-400/50' : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Step counter */}
        <span className="text-sm text-gray-300 tabular-nums min-w-[80px]">
          <span className="text-white font-semibold">{currentStep + 1}</span>
          <span className="text-gray-500"> / {totalSteps}</span>
        </span>

        {/* Control buttons */}
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="上一步"
            title="上一步 (←)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            aria-label={isPlaying ? '暂停' : '播放'}
            title={isPlaying ? '暂停 (Space)' : '播放 (Space)'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="下一步"
            title="下一步 (→)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Keyboard hint */}
        <span className="text-xs text-gray-500 min-w-[80px] text-right hidden sm:inline">
          ← → Space
        </span>
      </div>
    </div>
  );
};

export default ReplayControls;