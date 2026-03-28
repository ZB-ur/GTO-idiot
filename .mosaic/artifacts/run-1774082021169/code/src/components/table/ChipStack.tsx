

interface ChipStackProps {
  readonly amount: number;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

function formatChips(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  if (Number.isInteger(amount)) return amount.toString();
  return amount.toFixed(1);
}

function getChipColor(amount: number): string {
  if (amount >= 100) return 'bg-chip-black border-gray-500';
  if (amount >= 25) return 'bg-chip-green border-green-300';
  if (amount >= 5) return 'bg-chip-red border-red-300';
  return 'bg-chip-blue border-blue-300';
}

export function ChipStack({ amount, size = 'md', className = '' }: ChipStackProps) {
  if (amount <= 0) return null;

  const chipColor = getChipColor(amount);
  const sizeClass = size === 'sm' ? 'h-5 min-w-[2rem] text-[10px]' : 'h-6 min-w-[2.5rem] text-xs';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className={`${sizeClass} ${chipColor} flex items-center justify-center rounded-full border-2 px-1.5 font-mono font-bold text-white shadow-sm`}
      >
        {formatChips(amount)}
      </div>
    </div>
  );
}
