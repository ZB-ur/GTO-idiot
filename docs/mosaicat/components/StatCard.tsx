import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const trendConfig = {
  up: { icon: '↑', color: 'text-emerald-400' },
  down: { icon: '↓', color: 'text-red-400' },
  neutral: { icon: '→', color: 'text-gray-500' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-50">{value}</span>
        {trend && (
          <span className={`text-sm font-semibold ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-gray-500">{subtext}</p>
      )}
    </div>
  );
};