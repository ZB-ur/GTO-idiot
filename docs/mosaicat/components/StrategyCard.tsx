import React from 'react';

interface StrategyAction {
  actionType: string;
  frequency: string;
  sizing: string;
}

interface StrategyCardProps {
  position: string;
  sprRange: string;
  title: string;
  actions: StrategyAction[];
  keyPrinciple: string;
  isSimplified: boolean;
}

const actionColorMap: Record<string, string> = {
  Bet: 'bg-emerald-500/20 text-emerald-400',
  Raise: 'bg-emerald-500/20 text-emerald-400',
  Call: 'bg-amber-400/20 text-amber-400',
  Check: 'bg-gray-500/20 text-gray-400',
  Fold: 'bg-red-500/20 text-red-400',
};

const sprLabelMap: Record<string, string> = {
  low: 'Low SPR',
  medium: 'Mid SPR',
  high: 'High SPR',
};

export const StrategyCard: React.FC<StrategyCardProps> = ({
  position,
  sprRange,
  title,
  actions,
  keyPrinciple,
  isSimplified,
}) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-gray-100">{title}</h4>
        {isSimplified && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/20 text-amber-400">
            Simplified
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#334155] text-gray-300">
          {position === 'IP' ? '📍 In Position' : '📍 Out of Position'}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#334155] text-gray-300">
          {sprLabelMap[sprRange] ?? sprRange}
        </span>
      </div>

      {/* Actions table */}
      <div className="space-y-2 mb-4">
        {actions.map((action, i) => {
          const colorClass = actionColorMap[action.actionType] ?? 'bg-gray-500/20 text-gray-400';
          return (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colorClass}`}>
                  {action.actionType}
                </span>
                <span className="text-sm text-gray-400">{action.sizing}</span>
              </div>
              <span className="text-sm font-medium text-gray-200">{action.frequency}</span>
            </div>
          );
        })}
      </div>

      {/* Key principle */}
      <div className="bg-[#16213e] border border-gray-700/50 rounded-lg p-3">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Key Principle</p>
        <p className="text-sm text-gray-300">{keyPrinciple}</p>
      </div>
    </div>
  );
};

export default StrategyCard;