import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;