/**
 * ReplayControls — playback controls for stepping through hand replay.
 * Provides prev/next action, play/pause auto-advance, and speed control.
 */

import React, { useEffect, useCallback } from 'react';

interface ReplayControlsProps {
  /** Current action index (0-based). */
  currentIndex: number;
  /** Total number of actions across all streets. */
  totalActions: number;
  /** Called when the index changes. */
  onIndexChange: (index: number) => void;
  /** Whether auto-play is active. */
  isPlaying?: boolean;
  /** Toggle play/pause. */
  onTogglePlay?: () => void;
  className?: string;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentIndex,
  totalActions,
  onIndexChange,
  isPlaying = false,
  onTogglePlay,
  className = '',
}) => {
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < totalActions - 1;

  const handlePrev = useCallback(() => {
    if (canPrev) onIndexChange(currentIndex - 1);
  }, [canPrev, currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (canNext) onIndexChange(currentIndex + 1);
  }, [canNext, currentIndex, onIndexChange]);

  const handleFirst = useCallback(() => {
    onIndexChange(0);
  }, [onIndexChange]);

  const handleLast = useCallback(() => {
    onIndexChange(totalActions - 1);
  }, [onIndexChange, totalActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          onTogglePlay?.();
          break;
        case 'Home':
          e.preventDefault();
          handleFirst();
          break;
        case 'End':
          e.preventDefault();
          handleLast();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext, handleFirst, handleLast, onTogglePlay]);

  const progress = totalActions > 1 ? (currentIndex / (totalActions - 1)) * 100 : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-felt-500 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-2">
        {/* First */}
        <button
          onClick={handleFirst}
          disabled={!canPrev}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First action (Home)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
        </button>

        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous action (←)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Play/Pause */}
        {onTogglePlay && (
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-felt-600 hover:bg-felt-500 text-white
              transition-colors shadow-md"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next action (→)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Last */}
        <button
          onClick={handleLast}
          disabled={!canNext}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last action (End)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zM4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
          </svg>
        </button>
      </div>

      {/* Action counter */}
      <div className="text-center">
        <span className="text-xs text-gray-500">
          Action {currentIndex + 1} / {totalActions}
        </span>
      </div>
    </div>
  );
};

export default ReplayControls;
