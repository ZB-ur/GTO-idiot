import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { chip: 'w-6 h-6 text-[10px]', text: 'text-xs' },
  md: { chip: 'w-8 h-8 text-xs', text: 'text-sm' },
  lg: { chip: 'w-10 h-10 text-sm', text: 'text-base' },
};

const chipColors = [
  { min: 0, bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  { min: 5, bg: 'bg-red-500', border: 'border-red-700', text: 'text-white' },
  { min: 25, bg: 'bg-green-500', border: 'border-green-700', text: 'text-white' },
  { min: 100, bg: 'bg-blue-600', border: 'border-blue-800', text: 'text-white' },
  { min: 500, bg: 'bg-purple-600', border: 'border-purple-800', text: 'text-white' },
  { min: 1000, bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-gray-900' },
];

function getChipColor(amount: number) {
  let color = chipColors[0];
  for (const c of chipColors) {
    if (amount >= c.min) color = c;
  }
  return color;
}

function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return amount.toString();
}

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  animated = false,
  className = '',
}) => {
  const config = sizeConfig[size];
  const color = getChipColor(amount);
  const chipCount = Math.min(Math.max(Math.ceil(amount / 25), 1), 5);

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      {/* Stacked chips */}
      <div className="relative" style={{ height: `${chipCount * 4 + 28}px` }}>
        {Array.from({ length: chipCount }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${config.chip} ${color.bg} ${color.border} border-2 flex items-center justify-center shadow-sm ${
              animated ? 'transition-all duration-300' : ''
            }`}
            style={{ bottom: `${i * 4}px`, zIndex: i }}
          >
            {i === chipCount - 1 && (
              <span className={`font-bold ${color.text} leading-none`}>
                {formatAmount(amount)}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Amount label */}
      <span className={`${config.text} font-semibold text-gray-900`}>
        {formatAmount(amount)} BB
      </span>
    </div>
  );
};

export default ChipStack;