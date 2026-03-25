import React from 'react';

interface StatItemProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, color, className = '' }) => {
  const colorClass = color ? `text-${color}` : 'text-gray-900';

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
};

export default StatItem;