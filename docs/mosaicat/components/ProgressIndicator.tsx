import React from 'react';

interface ProgressIndicatorProps {
  current: number;
  target: number;
  label: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, target, label }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-50">{label}</span>
        <span className="text-sm text-gray-400">
          {current} / {target}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-emerald-500' : 'bg-emerald-500/60'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!isComplete && (
        <span className="text-xs text-gray-500">
          {target - current} more hands needed for leak analysis
        </span>
      )}
      {isComplete && (
        <span className="text-xs text-emerald-400">
          ✓ Leak analysis available
        </span>
      )}
    </div>
  );
};