import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md';
  animated?: boolean;
}

const chipDenominations = [
  { value: 1000, color: 'bg-yellow-400 border-yellow-500 text-yellow-900', label: '1K' },
  { value: 500, color: 'bg-purple-500 border-purple-600 text-white', label: '500' },
  { value: 100, color: 'bg-gray-900 border-gray-700 text-white', label: '100' },
  { value: 25, color: 'bg-emerald-500 border-emerald-600 text-white', label: '25' },
  { value: 5, color: 'bg-red-500 border-red-600 text-white', label: '5' },
  { value: 1, color: 'bg-white border-gray-300 text-gray-900', label: '1' },
];

function breakdownChips(amount: number): { value: number; count: number; color: string; label: string }[] {
  const result: { value: number; count: number; color: string; label: string }[] = [];
  let remaining = amount;
  for (const denom of chipDenominations) {
    const count = Math.floor(remaining / denom.value);
    if (count > 0) {
      result.push({ ...denom, count: Math.min(count, 5) });
      remaining -= count * denom.value;
    }
  }
  return result;
}

function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return amount.toLocaleString();
}

const sizeMap = {
  sm: { chip: 'w-6 h-6 text-[8px]', stack: 'gap-0.5' },
  md: { chip: 'w-8 h-8 text-[10px]', stack: 'gap-0.5' },
};

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  animated = false,
}) => {
  const s = sizeMap[size];
  const stacks = breakdownChips(amount);

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="flex items-end gap-1">
        {stacks.map((stack, i) => (
          <div key={i} className={`flex flex-col-reverse items-center ${s.stack}`}>
            {Array.from({ length: stack.count }).map((_, j) => (
              <div
                key={j}
                className={`
                  ${s.chip} rounded-full border-2 ${stack.color}
                  flex items-center justify-center font-bold shadow-sm
                  ${animated ? 'transition-transform duration-200 hover:-translate-y-0.5' : ''}
                `}
                style={{ marginTop: j > 0 ? '-4px' : '0' }}
              >
                {j === stack.count - 1 ? stack.label : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-900">{formatAmount(amount)}</span>
    </div>
  );
};

export default ChipStack;