/**
 * DeviationDetail — expanded view of a GTO deviation at a specific decision point.
 * Shows user action vs GTO recommendation, EV loss, and explanation.
 */

import React from 'react';
import type { GTOComparison } from '../../types/review';
import type { ActionType } from '../../types/poker';
import { GTOComparisonBadge } from './GTOComparisonBadge';

interface DeviationDetailProps {
  comparison: GTOComparison;
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

function formatAction(action: { actionType: ActionType; amount?: number; sizing?: string }): string {
  const label = ACTION_LABELS[action.actionType];
  if (action.sizing) return `${label} (${action.sizing})`;
  if (action.amount != null && action.amount > 0) return `${label} ${action.amount.toFixed(1)} BB`;
  return label;
}

export const DeviationDetail: React.FC<DeviationDetailProps> = ({
  comparison,
  className = '',
}) => {
  const { userAction, gtoAction, deviationLevel, evLoss, explanation } = comparison;
  const isConforming = deviationLevel === 'conforming';

  return (
    <div
      className={`rounded-lg border p-4 space-y-3
        ${isConforming
          ? 'border-green-500/30 bg-green-500/5'
          : deviationLevel === 'minor'
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : 'border-red-500/30 bg-red-500/5'
        }
        ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">GTO Comparison</span>
        <GTOComparisonBadge level={deviationLevel} size="md" />
      </div>

      {/* Action comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Your action */}
        <div className="space-y-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Your Action</span>
          <div className={`text-sm font-medium ${
            isConforming ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatAction(userAction)}
          </div>
        </div>

        {/* GTO recommendation */}
        <div className="space-y-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">GTO Suggests</span>
          <div className="text-sm font-medium text-blue-400">
            {formatAction(gtoAction)}
          </div>
        </div>
      </div>

      {/* EV Loss */}
      {evLoss != null && evLoss > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-gray-700/50">
          <span className="text-xs text-gray-500">Est. EV Loss:</span>
          <span className="text-sm font-mono text-red-400">
            -{evLoss.toFixed(1)} BB
          </span>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <p className="text-xs text-gray-400 leading-relaxed">
          {explanation}
        </p>
      )}
    </div>
  );
};

export default DeviationDetail;
