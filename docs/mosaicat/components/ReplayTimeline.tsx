import React from 'react';

interface TimelineStreet {
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  startStep: number;
  endStep: number;
  actionCount: number;
  userDecisionSteps?: number[];
}

interface ReplayTimelineData {
  handId: string;
  totalSteps: number;
  streets: TimelineStreet[];
}

interface ReplayTimelineProps {
  timeline: ReplayTimelineData;
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  timeline,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {timeline.streets.map((street) => {
          const steps = Array.from(
            { length: street.endStep - street.startStep + 1 },
            (_, i) => street.startStep + i
          );
          const userSteps = new Set(street.userDecisionSteps ?? []);

          return (
            <div key={street.street} className="flex flex-col gap-1.5">
              {/* Street label */}
              <span className="text-xs text-gray-500 font-medium text-center px-1">
                {STREET_LABELS[street.street] ?? street.street}
              </span>

              {/* Action dots */}
              <div className="flex gap-0.5 px-1">
                {steps.map((step) => {
                  const isCurrent = step === currentStep;
                  const isUserDecision = userSteps.has(step);

                  let dotClass =
                    'w-3 h-3 rounded-full cursor-pointer transition-all border-2 ';

                  if (isCurrent) {
                    dotClass += 'bg-emerald-500 border-emerald-400 ring-2 ring-emerald-500/30 scale-125';
                  } else if (isUserDecision) {
                    dotClass += 'bg-amber-500 border-amber-400 hover:scale-110';
                  } else {
                    dotClass += 'bg-gray-600 border-gray-500 hover:bg-gray-500 hover:scale-110';
                  }

                  return (
                    <button
                      key={step}
                      onClick={() => onStepClick(step)}
                      className={dotClass}
                      aria-label={`步骤 ${step + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-gray-400">当前位置</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-xs text-gray-400">你的决策点</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block" />
          <span className="text-xs text-gray-400">其他动作</span>
        </div>
      </div>
    </div>
  );
};