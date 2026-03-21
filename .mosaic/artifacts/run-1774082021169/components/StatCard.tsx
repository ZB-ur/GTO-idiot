import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  suffix?: string;
  className?: string;
}

const trendConfig: Record<string, { icon: string; color: string }> = {
  up:      { icon: '↑', color: 'text-green-500' },
  down:    { icon: '↓', color: 'text-rose-500' },
  neutral: { icon: '→', color: 'text-gray-400' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  suffix,
  className = '',
}) => {
  const trendStyle = trend ? trendConfig[trend] : null;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-2 ${className}`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
        {trendStyle && (
          <span className={`text-sm font-semibold ${trendStyle.color} ml-auto`}>
            {trendStyle.icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;