import React, { useEffect, useCallback } from 'react';

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  className?: string;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentStep,
  totalSteps,
  onFirst,
  onPrev,
  onNext,
  onLast,
  className = '',
}) => {
  const canPrev = currentStep > 0;
  const canNext = currentStep < totalSteps - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (e.shiftKey) onFirst();
        else onPrev();
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) onLast();
        else onNext();
      }
    },
    [onFirst, onPrev, onNext, onLast],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const btnBase =
    'p-2 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed';
  const btnDefault = `${btnBase} text-gray-400 hover:text-gray-100 hover:bg-slate-700`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* First */}
      <button onClick={onFirst} disabled={!canPrev} className={btnDefault} aria-label="First step">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
      </button>

      {/* Prev */}
      <button onClick={onPrev} disabled={!canPrev} className={btnDefault} aria-label="Previous step">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Step indicator */}
      <div className="px-4 py-1.5 bg-slate-800 border border-gray-700 rounded-lg min-w-[80px] text-center">
        <span className="text-sm font-bold text-gray-100 tabular-nums">
          {currentStep + 1}
        </span>
        <span className="text-sm text-gray-500"> / {totalSteps}</span>
      </div>

      {/* Next */}
      <button onClick={onNext} disabled={!canNext} className={btnDefault} aria-label="Next step">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Last */}
      <button onClick={onLast} disabled={!canNext} className={btnDefault} aria-label="Last step">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
        </svg>
      </button>
    </div>
  );
};

export default ReplayControls;