import React from 'react';

export type BadgeVariant = 'position' | 'bot-style' | 'quality';
export type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const variantDefaults: Record<BadgeVariant, BadgeColor> = {
  position: 'blue',
  'bot-style': 'gray',
  quality: 'green',
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'position',
  color,
}) => {
  const resolvedColor = color ?? variantDefaults[variant];
  const classes = colorMap[resolvedColor];

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-semibold rounded-lg border
        ${classes}
      `}
    >
      {label}
    </span>
  );
};

export default Badge;