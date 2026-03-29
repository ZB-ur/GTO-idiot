import React from 'react';

/** Matches API schema: components/schemas/ActionType */
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

/** Matches API schema: components/schemas/ActionFrequency */
export interface ActionFrequency {
  actionType: ActionType;
  frequency: number; // 0.0 – 1.0
  sizingBB?: number;
}

export interface GTOFrequencyChartProps {
  /** GTO recommended action distribution */
  gtoActions: ActionFrequency[];
  /** The action the player actually took */
  playerAction: ActionType;
  className?: string;
}

const ACTION_COLORS: Record<ActionType, { bar: string; bg: string; label: string }> = {
  fold: { bar: 'bg-red-500', bg: 'bg-red-100', label: 'Fold' },
  check: { bar: 'bg-gray-400', bg: 'bg-gray-100', label: 'Check' },
  call: { bar: 'bg-amber-500', bg: 'bg-amber-100', label: 'Call' },
  raise: { bar: 'bg-emerald-500', bg: 'bg-emerald-100', label: 'Raise' },
  all_in: { bar: 'bg-blue-600', bg: 'bg-blue-100', label: 'All-In' },
};

export const GTOFrequencyChart: React.FC<GTOFrequencyChartProps> = ({
  gtoActions,
  playerAction,
  className = '',
}) => {
  // Sort by frequency descending for visual clarity
  const sorted = [...gtoActions].sort((a, b) => b.frequency - a.frequency);
  const maxFreq = Math.max(...sorted.map((a) => a.frequency), 0.01);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">GTO Frequency</h4>
        <span className="text-xs text-gray-500">
          You chose:{' '}
          <span className="font-medium text-gray-900">
            {ACTION_COLORS[playerAction]?.label ?? playerAction}
          </span>
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((action) => {
          const pct = Math.round(action.frequency * 100);
          const widthPct = (action.frequency / maxFreq) * 100;
          const colors = ACTION_COLORS[action.actionType] ?? ACTION_COLORS.check;
          const isChosen = action.actionType === playerAction;

          return (
            <div key={action.actionType} className="group">
              {/* Label row */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-medium ${
                      isChosen ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {colors.label}
                  </span>
                  {isChosen && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                      YOUR ACTION
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs tabular-nums ${
                    isChosen ? 'font-semibold text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Bar */}
              <div
                className={`h-5 w-full rounded-lg overflow-hidden ${colors.bg}`}
              >
                <div
                  className={`h-full rounded-lg transition-all duration-500 ease-out ${colors.bar} ${
                    isChosen ? 'ring-2 ring-offset-1 ring-blue-600' : ''
                  }`}
                  style={{ width: `${widthPct}%`, minWidth: pct > 0 ? '4px' : '0' }}
                />
              </div>

              {/* Sizing info */}
              {action.sizingBB != null && action.sizingBB > 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Sizing: {action.sizingBB} BB
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend hint when player deviated */}
      {!sorted.some(
        (a) => a.actionType === playerAction && a.frequency >= 0.5
      ) &&
        sorted.length > 0 && (
          <p className="mt-3 text-[11px] text-red-500 leading-tight">
            Your action deviates from GTO recommendation.
          </p>
        )}
    </div>
  );
};

export default GTOFrequencyChart;