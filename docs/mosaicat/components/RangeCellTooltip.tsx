import React from 'react';

interface ActionInfo {
  actionType: string;
  frequency: number;
}

interface RangeCellTooltipProps {
  hand: string;
  actions: ActionInfo[];
  visible: boolean;
  position: { x: number; y: number };
}

const actionColors: Record<string, string> = {
  Raise: 'bg-red-500',
  Call: 'bg-emerald-500',
  Fold: 'bg-gray-500',
  '3-Bet': 'bg-amber-400',
  'All-In': 'bg-red-600',
};

const RangeCellTooltip: React.FC<RangeCellTooltipProps> = ({
  hand,
  actions,
  visible,
  position,
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 w-48 bg-[#1e293b] border border-gray-700 rounded-lg shadow-lg p-3 pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-sm font-bold text-gray-100 mb-2">{hand}</div>
      <div className="space-y-1.5">
        {actions.map((action) => (
          <div key={action.actionType} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  actionColors[action.actionType] || 'bg-gray-400'
                }`}
              />
              <span className="text-xs text-gray-300">
                {action.actionType}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    actionColors[action.actionType] || 'bg-gray-400'
                  }`}
                  style={{ width: `${action.frequency}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">
                {action.frequency}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RangeCellTooltip;