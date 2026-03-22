import React from 'react';

export interface ChipStackProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

const chipColors = [
  { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600' },      // white chip
  { bg: 'bg-red-500', border: 'border-red-700', text: 'text-white' },           // red chip
  { bg: 'bg-green-500', border: 'border-green-700', text: 'text-white' },       // green chip
  { bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-white' },         // blue chip
  { bg: 'bg-gray-800', border: 'border-gray-900', text: 'text-white' },         // black chip
];

const sizeConfig: Record<string, { chip: string; stack: string; text: string; offset: string }> = {
  sm: { chip: 'w-6 h-2', stack: 'w-6', text: 'text-xs', offset: '-mt-1' },
  md: { chip: 'w-8 h-2.5', stack: 'w-8', text: 'text-sm', offset: '-mt-1' },
  lg: { chip: 'w-10 h-3', stack: 'w-10', text: 'text-base', offset: '-mt-1.5' },
};

function getChipBreakdown(value: number): number[] {
  const denominations = [100, 25, 10, 5, 1];
  const counts: number[] = [];
  let remaining = Math.abs(value);

  for (const denom of denominations) {
    const count = Math.min(Math.floor(remaining / denom), 3);
    counts.push(count);
    remaining -= count * denom;
  }

  return counts;
}

export const ChipStack: React.FC<ChipStackProps> = ({
  value,
  size = 'md',
  animate = false,
  className = '',
}) => {
  const config = sizeConfig[size];
  const breakdown = getChipBreakdown(value);

  const chips: { colorIdx: number }[] = [];
  breakdown.forEach((count, idx) => {
    for (let i = 0; i < count; i++) {
      chips.push({ colorIdx: idx });
    }
  });

  if (chips.length === 0) {
    chips.push({ colorIdx: 0 });
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex flex-col-reverse items-center ${config.stack}`}>
        {chips.map((chip, i) => {
          const color = chipColors[chip.colorIdx];
          return (
            <div
              key={i}
              className={`${config.chip} rounded-full border-2 ${color.bg} ${color.border} ${
                i > 0 ? config.offset : ''
              } ${animate ? 'animate-bounce' : ''}`}
              style={animate ? { animationDelay: `${i * 50}ms` } : undefined}
            />
          );
        })}
      </div>
      <span className={`${config.text} font-semibold text-gray-900 mt-1`}>
        {value.toLocaleString()} BB
      </span>
    </div>
  );
};

export default ChipStack;