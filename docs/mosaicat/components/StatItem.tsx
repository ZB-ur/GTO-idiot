import React from 'react';

interface StatItemProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'positive' | 'negative';
}

const variantStyles: Record<string, string> = {
  default: 'text-gray-900',
  positive: 'text-green-500',
  negative: 'text-red-500',
};

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  variant = 'default',
}) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-xl font-bold ${variantStyles[variant]}`}>
        {value}
      </span>
    </div>
  );
};

export default StatItem;