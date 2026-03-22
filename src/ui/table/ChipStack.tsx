import React from 'react';

export interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { text: 'text-xs', chip: 'w-3 h-1.5', stack: 'gap-0.5', padding: 'px-1.5 py-0.5' },
  md: { text: 'text-sm', chip: 'w-4 h-2', stack: 'gap-0.5', padding: 'px-2 py-1' },
  lg: { text: 'text-base', chip: 'w-5 h-2.5', stack: 'gap-1', padding: 'px-3 py-1.5' },
};

const chipColors = [
  'bg-red-500 border-red-700',
  'bg-blue-500 border-blue-700',
  'bg-green-500 border-green-700',
  'bg-yellow-400 border-yellow-600',
  'bg-purple-500 border-purple-700',
];

function getChipBreakdown(amount: number): number[] {
  if (amount <= 0) return [];
  const layers = Math.min(Math.ceil(Math.log10(Math.max(amount, 2))), 5);
  return Array.from({ length: layers }, (_, i) => i);
}

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${(amount / 1_000).toFixed(1)}K`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

const ChipStack: React.FC<ChipStackProps> = ({ amount, size = 'md' }) => {
  const config = sizeConfig[size];
  const chips = getChipBreakdown(amount);

  if (amount <= 0) return null;

  return (
    <div className="flex items-center gap-1.5" aria-label={`${amount} chips`}>
      <div className={`flex flex-col-reverse ${config.stack}`}>
        {chips.map((i) => (
          <div
            key={i}
            className={`
              ${config.chip} rounded-full border
              ${chipColors[i % chipColors.length]}
              shadow-sm
            `}
            style={{ marginTop: i > 0 ? '-2px' : 0 }}
          />
        ))}
      </div>
      <span
        className={`
          ${config.text} ${config.padding}
          font-bold text-yellow-300
          bg-black/60 rounded-full
          whitespace-nowrap
        `}
      >
        {formatChips(amount)}
      </span>
    </div>
  );
};

export default ChipStack;
