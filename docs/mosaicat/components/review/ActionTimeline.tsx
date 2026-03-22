import React, { useState } from 'react';
import { DeviationDetail, GTOComparison } from './DeviationDetail';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface ReviewAction {
  playerId: string;
  playerName: string;
  position: Position;
  actionType: ActionType;
  amount?: number;
  isHumanAction: boolean;
  gtoComparison?: GTOComparison;
}

interface ActionTimelineProps {
  actions: ReviewAction[];
  currentActionIndex?: number;
}

const actionLabels: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-In',
};

const actionIcons: Record<ActionType, string> = {
  fold: '✕',
  check: '✓',
  call: '→',
  bet: '●',
  raise: '▲',
  all_in: '★',
};

export const ActionTimeline: React.FC<ActionTimelineProps> = ({
  actions,
  currentActionIndex,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-1">
        {actions.map((action, index) => {
          const isCurrent = currentActionIndex === index;
          const isHuman = action.isHumanAction;
          const hasDeviation = isHuman && action.gtoComparison;

          return (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute left-3.5 top-3.5 w-3 h-3 rounded-full border-2 z-10 ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100'
                    : isHuman
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-300 border-gray-300'
                }`}
              />

              <div className={`ml-10 ${hasDeviation ? '' : 'py-2'}`}>
                {hasDeviation && action.gtoComparison ? (
                  <DeviationDetail
                    comparison={action.gtoComparison}
                    isExpanded={expandedIndex === index}
                    onToggle={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  />
                ) : (
                  <div
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors ${
                      isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs text-gray-400 font-mono w-6 text-center">
                      {actionIcons[action.actionType]}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-8">
                      {action.position}
                    </span>
                    <span className={`text-sm ${isHuman ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                      {action.playerName}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {actionLabels[action.actionType]}
                      {action.amount !== undefined && (
                        <span className="text-gray-500 ml-1">{action.amount.toFixed(1)}BB</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionTimeline;