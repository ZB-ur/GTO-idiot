import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const chipColors = [
  { bg: 'bg-gray-100', border: 'border-gray-300', label: 'white' },    // 1s
  { bg: 'bg-red-500', border: 'border-red-700', label: 'red' },        // 5s
  { bg: 'bg-green-500', border: 'border-green-700', label: 'green' },  // 25s
  { bg: 'bg-gray-800', border: 'border-gray-950', label: 'black' },    // 100s
  { bg: 'bg-purple-500', border: 'border-purple-700', label: 'purple' }, // 500s
  { bg: 'bg-yellow-400', border: 'border-yellow-600', label: 'gold' }, // 1000s
];

const sizeMap = {
  sm: { w: 'w-6', h: 'h-1.5', text: 'text-xs', gap: '-mt-0.5' },
  md: { w: 'w-8', h: 'h-2', text: 'text-sm', gap: '-mt-1' },
  lg: { w: 'w-10', h: 'h-2.5', text: 'text-base', gap: '-mt-1' },
};

function getChipLayers(amount: number): number[] {
  const denominations = [1000, 500, 100, 25, 5, 1];
  const layers: number[] = [];
  let remaining = amount;
  for (const denom of denominations) {
    while (remaining >= denom && layers.length < 10) {
      layers.push(denominations.indexOf(denom));
      remaining -= denom;
    }
  }
  return layers.reverse();
}

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  animate = false,
}) => {
  const s = sizeMap[size];
  const layers = getChipLayers(amount);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="flex flex-col-reverse items-center">
        {layers.map((colorIdx, i) => (
          <div
            key={i}
            className={`
              ${s.w} ${s.h} rounded-full border-2
              ${chipColors[colorIdx].bg} ${chipColors[colorIdx].border}
              ${i > 0 ? s.gap : ''}
              ${animate ? 'transition-all duration-300' : ''}
            `}
            style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.15)' }}
          />
        ))}
      </div>
      <span className={`${s.text} font-semibold text-gray-900 mt-1`}>
        {amount.toLocaleString()}
      </span>
    </div>
  );
};

export default ChipStack;