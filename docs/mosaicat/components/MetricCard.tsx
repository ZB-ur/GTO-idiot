import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'default';
  suffix?: string;
}

const colorMap: Record<string, string> = {
  green: 'text-emerald-500',
  red: 'text-red-500',
  default: 'text-gray-100',
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, color = 'default', suffix }) => {
  const valueColor = colorMap[color] ?? colorMap.default;

  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
      <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${valueColor}`}>{value}</span>
        {suffix && <span className="text-gray-500 text-sm font-medium">{suffix}</span>}
      </div>
    </div>
  );
};

export default MetricCard;