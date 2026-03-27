import React from 'react';

interface ActionDistributionBarProps {
  distribution: { raise: number; call: number; fold: number };
  className?: string;
}

export const ActionDistributionBar: React.FC<ActionDistributionBarProps> = ({
  distribution,
  className = '',
}) => {
  const total = distribution.raise + distribution.call + distribution.fold;
  const raisePercent = total > 0 ? (distribution.raise / total) * 100 : 0;
  const callPercent = total > 0 ? (distribution.call / total) * 100 : 0;
  const foldPercent = total > 0 ? (distribution.fold / total) * 100 : 0;

  return (
    <div className={className}>
      <div className="flex h-3 w-full rounded-lg overflow-hidden">
        {raisePercent > 0 && (
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${raisePercent}%` }}
          />
        )}
        {callPercent > 0 && (
          <div
            className="bg-emerald-400 transition-all duration-300"
            style={{ width: `${callPercent}%` }}
          />
        )}
        {foldPercent > 0 && (
          <div
            className="bg-sky-400 transition-all duration-300"
            style={{ width: `${foldPercent}%` }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-red-400 font-medium">Raise {Math.round(raisePercent)}%</span>
        <span className="text-emerald-400 font-medium">Call {Math.round(callPercent)}%</span>
        <span className="text-sky-400 font-medium">Fold {Math.round(foldPercent)}%</span>
      </div>
    </div>
  );
};