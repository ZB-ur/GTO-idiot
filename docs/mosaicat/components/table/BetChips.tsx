import React from 'react';

interface BetChipsProps {
  amount: number;
  animate?: boolean;
  className?: string;
}

const CHIP_COLORS = [
  { min: 0, bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  { min: 5, bg: 'bg-red-500', border: 'border-red-700', text: 'text-white' },
  { min: 25, bg: 'bg-green-500', border: 'border-green-700', text: 'text-white' },
  { min: 100, bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-white' },
  { min: 500, bg: 'bg-purple-500', border: 'border-purple-700', text: 'text-white' },
  { min: 1000, bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-gray-900' },
];

function getChipStyle(amount: number) {
  let style = CHIP_COLORS[0];
  for (const c of CHIP_COLORS) {
    if (amount >= c.min) style = c;
  }
  return style;
}

function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return amount.toString();
}

export const BetChips: React.FC<BetChipsProps> = ({
  amount,
  animate = false,
  className = '',
}) => {
  const chip = getChipStyle(amount);
  const stackCount = Math.min(Math.max(Math.ceil(amount / 100), 1), 4);

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      {/* Chip stack */}
      <div className="relative" style={{ height: `${20 + (stackCount - 1) * 4}px`, width: '32px' }}>
        {Array.from({ length: stackCount }).map((_, i) => (
          <div
            key={i}
            className={`
              absolute left-0 w-8 h-5 rounded-full
              ${chip.bg} border ${chip.border}
              shadow-sm
              ${animate ? 'animate-bounce' : ''}
            `}
            style={{ bottom: `${i * 4}px`, zIndex: i }}
          />
        ))}
      </div>
      {/* Amount label */}
      <span className="text-xs font-semibold text-gray-900 bg-white/80 px-1.5 py-0.5 rounded">
        {formatAmount(amount)}
      </span>
    </div>
  );
};