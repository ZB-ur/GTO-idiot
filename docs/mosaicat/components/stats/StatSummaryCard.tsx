import React from 'react';

interface StatSummaryCardProps {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'neutral';
  suffix?: string;
}

const colorMap = {
  green: 'text-emerald-500',
  red: 'text-red-500',
  neutral: 'text-gray-50',
} as const;

export const StatSummaryCard: React.FC<StatSummaryCardProps> = ({
  label,
  value,
  color = 'neutral',
  suffix,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colorMap[color]}`}>
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-gray-500">{suffix}</span>
        )}
      </div>
    </div>
  );
};