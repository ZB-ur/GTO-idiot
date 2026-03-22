import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

const trendConfig: Record<string, { color: string; arrow: string }> = {
  positive: { color: 'text-emerald-500', arrow: '↑' },
  negative: { color: 'text-red-500', arrow: '↓' },
  neutral: { color: 'text-gray-400', arrow: '→' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  trend,
  icon,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trendConfig[trend].color} pb-0.5`}>
            {trendConfig[trend].arrow}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;