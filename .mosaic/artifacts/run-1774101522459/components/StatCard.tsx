import React from 'react';

type TrendDirection = 'up' | 'down' | 'flat';

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: string;
}

const TrendIcon: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  if (direction === 'up') {
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
};

const TREND_TEXT_COLOR: Record<TrendDirection, string> = {
  up: 'text-green-500',
  down: 'text-red-500',
  flat: 'text-gray-400',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, unit, trend, trendValue }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-2 min-w-[180px]">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 ${TREND_TEXT_COLOR[trend]}`}>
          <TrendIcon direction={trend} />
          {trendValue && <span className="text-sm font-medium">{trendValue}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;