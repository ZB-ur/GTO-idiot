import React, { useCallback, useEffect } from 'react';

export interface ReplayControlsProps {
  currentIndex: number;
  totalDecisions: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onSeek: (index: number) => void;
}

const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentIndex,
  totalDecisions,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onSeek,
}) => {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalDecisions - 1;
  const progress = totalDecisions > 1 ? (currentIndex / (totalDecisions - 1)) * 100 : 0;

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
        case 'Home':
          e.preventDefault();
          onFirst();
          break;
        case 'End':
          e.preventDefault();
          onLast();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirst, isLast, onPrev, onNext, onFirst, onLast]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(Number(e.target.value));
    },
    [onSeek],
  );

  return (
    <div className="w-full bg-gray-800 border border-gray-600 rounded-xl p-4 space-y-3">
      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
        {totalDecisions <= 20 && (
          <div className="absolute inset-0 flex items-center justify-between">
            {Array.from({ length: totalDecisions }, (_, i) => (
              <button
                key={i}
                onClick={() => onSeek(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i <= currentIndex ? 'bg-emerald-400' : 'bg-gray-600'
                } ${i === currentIndex ? 'ring-2 ring-emerald-400/50 scale-125' : ''}`}
              />
            ))}
          </div>
        )}
        {totalDecisions > 20 && (
          <input
            type="range"
            min={0}
            max={totalDecisions - 1}
            value={currentIndex}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Step counter */}
        <span className="text-sm text-gray-300 tabular-nums min-w-[80px]">
          <span className="text-white font-semibold">{currentIndex + 1}</span>
          <span className="text-gray-500"> / {totalDecisions}</span>
        </span>

        {/* Control buttons */}
        <div className="flex items-center gap-1.5">
          {/* First */}
          <button
            onClick={onFirst}
            disabled={isFirst}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="跳到开头 (Home)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上一步 (←)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下一步 (→)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last */}
          <button
            onClick={onLast}
            disabled={isLast}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="跳到结尾 (End)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Keyboard hint */}
        <span className="text-xs text-gray-500 min-w-[80px] text-right hidden sm:inline">
          ← → Home End
        </span>
      </div>
    </div>
  );
};

export default ReplayControls;