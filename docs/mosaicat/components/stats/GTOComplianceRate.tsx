import React from 'react';

interface GTOComplianceRateProps {
  rate: number;
  totalDecisions: number;
}

export const GTOComplianceRate: React.FC<GTOComplianceRateProps> = ({
  rate,
  totalDecisions,
}) => {
  const percentage = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - rate);

  const rateColor =
    percentage >= 70
      ? 'text-emerald-500'
      : percentage >= 40
        ? 'text-yellow-500'
        : 'text-red-500';

  const strokeColor =
    percentage >= 70 ? '#10b981' : percentage >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-center gap-5">
      {/* Ring */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${rateColor}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold text-gray-50">
          GTO 符合率
        </span>
        <span className="text-sm text-gray-400">
          ✅ 最优决策占比
        </span>
        <span className="text-xs text-gray-500">
          共 {totalDecisions} 个决策点
        </span>
      </div>
    </div>
  );
};