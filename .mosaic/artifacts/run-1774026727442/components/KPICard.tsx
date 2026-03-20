import React, { ReactNode } from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

const trendConfig = {
  up: { icon: '↑', color: 'text-green-400' },
  down: { icon: '↓', color: 'text-red-400' },
  neutral: { icon: '→', color: 'text-gray-400' },
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, unit, trend, icon }) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-5 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        {icon && <span className="text-gray-500 text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-2xl font-bold">{value}</span>
        {unit && <span className="text-gray-400 text-sm">{unit}</span>}
        {trend && (
          <span className={`text-sm font-semibold ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;