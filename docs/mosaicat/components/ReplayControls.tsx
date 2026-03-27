import React from 'react';

interface ReplayTimelineProps {
  currentStep: number;
  totalSteps: number;
  userDecisionIndices: number[];
  onJump: (index: number) => void;
}

const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  currentStep,
  totalSteps,
  userDecisionIndices,
  onJump,
}) => {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="relative w-full h-3 group cursor-pointer">
      {/* Track */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* User Decision Markers */}
      {userDecisionIndices.map((idx) => {
        const pos = totalSteps > 1 ? (idx / (totalSteps - 1)) * 100 : 0;
        return (
          <button
            key={idx}
            onClick={() => onJump(idx)}
            className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
              idx <= currentStep
                ? 'bg-emerald-400 border-emerald-300'
                : 'bg-gray-600 border-gray-500'
            } hover:scale-125`}
            style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
            title={`Decision point ${idx}`}
          />
        );
      })}
      {/* Current Position Indicator */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-950 shadow-lg pointer-events-none transition-all"
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  userDecisionIndices: number[];
  onPrevious: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentStep,
  totalSteps,
  userDecisionIndices,
  onPrevious,
  onNext,
  onJump,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep >= totalSteps - 1;

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 space-y-4">
      {/* Timeline */}
      <ReplayTimeline
        currentStep={currentStep}
        totalSteps={totalSteps}
        userDecisionIndices={userDecisionIndices}
        onJump={onJump}
      />

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isFirst
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Step</span>
          <span className="text-lg font-bold text-gray-50">
            {currentStep + 1}
          </span>
          <span className="text-sm text-gray-500">/ {totalSteps}</span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={isLast}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isLast
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-emerald-600 text-gray-50 hover:bg-emerald-500 border border-emerald-500'
          }`}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReplayControls;