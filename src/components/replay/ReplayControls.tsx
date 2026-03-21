// ============================================================
// GTO Idiot — Replay Controls Component
// Playback controls: prev, next, play/pause, speed, street jump
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReplayData, Street } from '../../types';

interface ReplayControlsProps {
  replayData: ReplayData;
  currentStep: number;
  onStepChange: (step: number) => void;
}

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const SPEED_OPTIONS = [
  { value: 500, label: '2x' },
  { value: 1000, label: '1x' },
  { value: 2000, label: '0.5x' },
];

export default function ReplayControls({
  replayData,
  currentStep,
  onStepChange,
}: ReplayControlsProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = replayData.total_steps;
  const isFirst = currentStep === 0;
  const isLast = currentStep >= totalSteps - 1;

  // Auto-play timer
  useEffect(() => {
    if (playing && !isLast) {
      timerRef.current = setInterval(() => {
        onStepChange(currentStep + 1);
      }, speed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, currentStep, speed, isLast, onStepChange]);

  // Stop playing when reaching the end
  useEffect(() => {
    if (isLast && playing) {
      setPlaying(false);
    }
  }, [isLast, playing]);

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setPlaying(false);
      onStepChange(currentStep - 1);
    }
  }, [isFirst, currentStep, onStepChange]);

  const handleNext = useCallback(() => {
    if (!isLast) {
      setPlaying(false);
      onStepChange(currentStep + 1);
    }
  }, [isLast, currentStep, onStepChange]);

  const handlePlayPause = useCallback(() => {
    if (isLast) {
      // Restart from beginning
      onStepChange(0);
      setPlaying(true);
    } else {
      setPlaying((v) => !v);
    }
  }, [isLast, onStepChange]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlaying(false);
      onStepChange(Number(e.target.value));
    },
    [onStepChange],
  );

  // Street jump buttons
  const streetButtons = buildStreetButtons(replayData);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      {/* Progress slider */}
      <div className="flex items-center gap-3">
        <span className="w-10 text-right text-xs text-gray-500">
          {currentStep + 1}
        </span>
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleSliderChange}
          className="flex-1 accent-green-500"
        />
        <span className="w-10 text-xs text-gray-500">{totalSteps}</span>
      </div>

      {/* Playback buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="rounded-md p-2 text-gray-400 transition hover:text-white disabled:opacity-30"
          aria-label="Previous step"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-700"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={isLast}
          className="rounded-md p-2 text-gray-400 transition hover:text-white disabled:opacity-30"
          aria-label="Next step"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Street jump + speed */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {streetButtons.map(({ street, stepIndex }) => {
            const isActive =
              replayData.steps[currentStep]?.street === street;
            return (
              <button
                key={street}
                onClick={() => {
                  setPlaying(false);
                  onStepChange(stepIndex);
                }}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {STREET_LABELS[street]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Speed:</span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`rounded px-2 py-0.5 text-xs transition ${
                speed === opt.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function buildStreetButtons(
  replayData: ReplayData,
): { street: Street; stepIndex: number }[] {
  const buttons: { street: Street; stepIndex: number }[] = [
    { street: 'preflop', stepIndex: replayData.street_indices.preflop },
  ];

  if (replayData.street_indices.flop != null) {
    buttons.push({ street: 'flop', stepIndex: replayData.street_indices.flop });
  }
  if (replayData.street_indices.turn != null) {
    buttons.push({ street: 'turn', stepIndex: replayData.street_indices.turn });
  }
  if (replayData.street_indices.river != null) {
    buttons.push({ street: 'river', stepIndex: replayData.street_indices.river });
  }

  return buttons;
}
