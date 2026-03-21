'use client';

import type { Street } from '@/engine/types';

interface ReplayControlsProps {
  currentFrame: number;
  totalFrames: number;
  currentStreet: Street;
  onPrev: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
  onJumpToStreet: (street: Street) => void;
}

const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Pre',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export default function ReplayControls({
  currentFrame,
  totalFrames,
  currentStreet,
  onPrev,
  onNext,
  onStart,
  onEnd,
  onJumpToStreet,
}: ReplayControlsProps) {
  const progress = totalFrames > 1 ? (currentFrame / (totalFrames - 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onStart}
            disabled={currentFrame === 0}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Go to start"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onPrev}
            disabled={currentFrame === 0}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous frame"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <span className="text-gray-400 text-xs font-mono px-2 min-w-[60px] text-center">
            {currentFrame + 1} / {totalFrames}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={currentFrame >= totalFrames - 1}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next frame"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onEnd}
            disabled={currentFrame >= totalFrames - 1}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Go to end"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
            </svg>
          </button>
        </div>

        {/* Street jump shortcuts */}
        <div className="flex gap-1">
          {STREETS.map((street) => (
            <button
              key={street}
              type="button"
              onClick={() => onJumpToStreet(street)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentStreet === street
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
              }`}
            >
              {STREET_LABELS[street]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}