import React from 'react';

export interface GTOAction {
  actionType: string;
  amount?: number;
  label: string;
}

export interface GTORecommendColumnProps {
  action: GTOAction;
  isApproximate: boolean;
}

const actionColorMap: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-emerald-500',
  call: 'text-sky-400',
  bet: 'text-amber-500',
  raise: 'text-amber-500',
  'all-in': 'text-red-500',
};

export const GTORecommendColumn: React.FC<GTORecommendColumnProps> = ({
  action,
  isApproximate,
}) => {
  const colorClass = actionColorMap[action.actionType] ?? 'text-gray-400';

  return (
    <div className="flex-1 flex flex-col items-center gap-3 p-4 bg-gray-900 rounded-xl border border-amber-500/30">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">
          GTO推荐
        </span>
        {isApproximate && (
          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full font-medium">
            近似
          </span>
        )}
      </div>

      {/* Action display */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xl font-bold ${colorClass}`}>
          {action.label}
        </span>
        {action.amount != null && (
          <span className="text-sm text-gray-400 font-mono">
            {action.amount} BB
          </span>
        )}
      </div>
    </div>
  );
};