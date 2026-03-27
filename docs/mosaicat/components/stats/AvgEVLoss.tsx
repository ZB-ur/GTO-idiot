import React from 'react';

interface AvgEVLossProps {
  avgLoss: number;
  isEstimated: boolean;
}

export const AvgEVLoss: React.FC<AvgEVLossProps> = ({
  avgLoss,
  isEstimated,
}) => {
  const severity =
    avgLoss <= 0.5
      ? { color: 'text-emerald-500', label: '优秀' }
      : avgLoss <= 1.5
        ? { color: 'text-yellow-500', label: '一般' }
        : { color: 'text-red-500', label: '需改进' };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">平均 EV 损失</span>
        {isEstimated && (
          <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
            估算
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${severity.color}`}>
          {avgLoss.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">BB / 手</span>
      </div>
      <span className={`text-xs ${severity.color}`}>{severity.label}</span>
    </div>
  );
};