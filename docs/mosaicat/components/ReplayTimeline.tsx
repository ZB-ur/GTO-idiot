import React from 'react';

type GtoRating = 'green' | 'yellow' | 'red' | 'gray';

interface TimelineStep {
  stepIndex: number;
  isUserDecision: boolean;
  gtoRating?: GtoRating;
}

interface ReplayTimelineProps {
  steps: TimelineStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  className?: string;
}

const ratingColors: Record<GtoRating, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

const ratingRings: Record<GtoRating, string> = {
  green: 'ring-emerald-400',
  yellow: 'ring-amber-300',
  red: 'ring-red-400',
  gray: 'ring-gray-400',
};

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Dot timeline */}
      <div className="flex items-center gap-1 px-1">
        {steps.map((step) => {
          const isCurrent = step.stepIndex === currentStep;
          const isPast = step.stepIndex < currentStep;

          let dotColor: string;
          let ringClass = '';

          if (step.isUserDecision && step.gtoRating) {
            dotColor = ratingColors[step.gtoRating];
            if (isCurrent) ringClass = `ring-2 ring-offset-1 ring-offset-[#1e293b] ${ratingRings[step.gtoRating]}`;
          } else {
            dotColor = isPast ? 'bg-gray-500' : 'bg-gray-700';
            if (isCurrent) ringClass = 'ring-2 ring-offset-1 ring-offset-[#1e293b] ring-gray-400';
          }

          return (
            <button
              key={step.stepIndex}
              onClick={() => onStepClick(step.stepIndex)}
              className={`
                flex-shrink-0 rounded-full transition-all duration-150
                ${step.isUserDecision ? 'w-4 h-4' : 'w-2.5 h-2.5'}
                ${dotColor} ${ringClass}
                ${isCurrent ? 'scale-125' : 'hover:scale-110'}
              `}
              aria-label={`Step ${step.stepIndex + 1}${step.isUserDecision ? ' (your decision)' : ''}`}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-emerald-500/60 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ReplayTimeline;