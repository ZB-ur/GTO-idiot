import React from 'react';

export type DeviationSeverity = 'none' | 'minor' | 'major';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

export interface DecisionPoint {
  index: number;
  street: Street;
  playerAction: {
    actionType: ActionType;
    amount?: number;
  };
  gtoEvaluation: {
    deviationSeverity: DeviationSeverity;
    evAnalysis: {
      evLoss: number;
    };
  };
}

interface DecisionTimelineProps {
  decisionPoints: DecisionPoint[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const streetLabel: Record<Street, string> = {
  preflop: 'PF',
  flop: 'F',
  turn: 'T',
  river: 'R',
};

const actionLabel: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-in',
};

const severityColors: Record<DeviationSeverity, { dot: string; ring: string; bg: string; text: string }> = {
  none: {
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  minor: {
    dot: 'bg-amber-500',
    ring: 'ring-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  major: {
    dot: 'bg-red-500',
    ring: 'ring-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
};

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  decisionPoints,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max px-4 py-3">
        {decisionPoints.map((dp, i) => {
          const isCurrent = dp.index === currentIndex;
          const severity = dp.gtoEvaluation.deviationSeverity;
          const colors = severityColors[severity];
          const isDeviation = severity !== 'none';

          return (
            <React.Fragment key={dp.index}>
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={`h-0.5 w-8 flex-shrink-0 ${
                    dp.index <= currentIndex ? 'bg-blue-300' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Decision node */}
              <button
                onClick={() => onSelect(dp.index)}
                className={`
                  relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg
                  transition-all duration-150 cursor-pointer flex-shrink-0
                  ${isCurrent
                    ? 'bg-blue-50 ring-2 ring-blue-600 shadow-sm'
                    : 'hover:bg-gray-50'
                  }
                `}
                aria-label={`Decision ${dp.index + 1}: ${streetLabel[dp.street]} ${actionLabel[dp.playerAction.actionType]}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Street label */}
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  {streetLabel[dp.street]}
                </span>

                {/* Dot indicator */}
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${colors.dot}
                    ${isCurrent ? `ring-2 ring-offset-2 ${colors.ring}` : ''}
                    transition-all duration-150
                  `}
                >
                  {isDeviation && (
                    <span className="text-white text-[10px] font-bold">!</span>
                  )}
                </div>

                {/* Action label */}
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {actionLabel[dp.playerAction.actionType]}
                </span>

                {/* EV loss badge (DeviationBadge child) */}
                {isDeviation && (
                  <span
                    className={`
                      inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold
                      ${colors.bg} ${colors.text}
                    `}
                  >
                    -{dp.gtoEvaluation.evAnalysis.evLoss.toFixed(1)} BB
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionTimeline;