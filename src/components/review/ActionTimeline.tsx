/**
 * ActionTimeline — vertical timeline of actions within a street.
 * Human actions are highlighted and decorated with GTO comparison badges.
 */

import React from 'react';
import type { ReviewAction } from '../../types/review';
import type { ActionType } from '../../types/poker';
import { GTOComparisonBadge } from './GTOComparisonBadge';

interface ActionTimelineProps {
  actions: ReviewAction[];
  onSelectAction?: (index: number) => void;
  selectedIndex?: number;
  className?: string;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-In',
};

const ACTION_ICONS: Record<ActionType, string> = {
  fold: '🏳️',
  check: '✓',
  call: '📞',
  bet: '💰',
  raise: '⬆️',
  all_in: '🔥',
};

export const ActionTimeline: React.FC<ActionTimelineProps> = ({
  actions,
  onSelectAction,
  selectedIndex,
  className = '',
}) => {
  if (actions.length === 0) {
    return (
      <div className={`text-sm text-gray-500 italic py-4 text-center ${className}`}>
        No actions on this street
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-700" />

      <div className="space-y-1">
        {actions.map((action, idx) => {
          const isHuman = action.isHumanAction;
          const isSelected = selectedIndex === idx;
          const hasDeviation =
            isHuman &&
            action.gtoComparison &&
            action.gtoComparison.deviationLevel !== 'conforming';

          return (
            <button
              key={idx}
              onClick={() => onSelectAction?.(idx)}
              className={`w-full relative flex items-start gap-3 pl-8 pr-3 py-2 rounded-lg
                text-left transition-colors
                ${isSelected
                  ? 'bg-gray-700/60'
                  : isHuman
                    ? 'hover:bg-gray-700/30'
                    : 'hover:bg-gray-800/50'
                }
                ${isHuman ? 'border-l-2 border-felt-500 ml-0' : ''}`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-2.5 top-3.5 w-3 h-3 rounded-full border-2
                  ${isHuman
                    ? hasDeviation
                      ? 'bg-red-500 border-red-400'
                      : 'bg-felt-500 border-felt-400'
                    : 'bg-gray-600 border-gray-500'
                  }`}
              />

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isHuman ? 'text-white' : 'text-gray-400'}`}>
                    {action.playerName}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {action.position}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs">{ACTION_ICONS[action.actionType]}</span>
                  <span className={`text-sm ${isHuman ? 'text-gray-200' : 'text-gray-500'}`}>
                    {ACTION_LABELS[action.actionType]}
                    {action.amount != null && action.amount > 0 && (
                      <span className="ml-1 font-mono">{action.amount.toFixed(1)} BB</span>
                    )}
                  </span>
                </div>
              </div>

              {/* GTO badge for human actions */}
              {isHuman && action.gtoComparison && (
                <div className="shrink-0 mt-1">
                  <GTOComparisonBadge
                    level={action.gtoComparison.deviationLevel}
                    size="sm"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionTimeline;
