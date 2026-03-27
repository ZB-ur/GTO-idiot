import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
}

const trendConfig = {
  up: { icon: '↑', color: 'text-emerald-400' },
  down: { icon: '↓', color: 'text-red-400' },
  neutral: { icon: '→', color: 'text-gray-400' },
};

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, suffix }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col gap-2">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-50">{value}</span>
        {suffix && <span className="text-lg text-gray-400">{suffix}</span>}
        {trend && (
          <span className={`text-sm font-medium ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>
    </div>
  );
};