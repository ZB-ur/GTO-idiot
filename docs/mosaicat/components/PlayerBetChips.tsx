import React from 'react';

interface PlayerBetChipsProps {
  amount: number;
  animate?: boolean;
}

function formatBB(amount: number): string {
  if (Number.isInteger(amount)) return `${amount}`;
  return amount.toFixed(1);
}

export const PlayerBetChips: React.FC<PlayerBetChipsProps> = ({
  amount,
  animate = false,
}) => {
  if (amount <= 0) return null;

  // Determine chip stack visual: more chips for larger bets
  const chipCount = amount >= 20 ? 4 : amount >= 10 ? 3 : amount >= 3 ? 2 : 1;

  const chipColors = [
    'bg-emerald-500 border-emerald-400',
    'bg-blue-500 border-blue-400',
    'bg-red-500 border-red-400',
    'bg-amber-500 border-amber-400',
  ];

  return (
    <div
      className={`
        flex items-center gap-1.5
        ${animate ? 'animate-[slideUp_0.3s_ease-out]' : ''}
      `}
    >
      {/* Chip stack visual */}
      <div className="relative flex flex-col-reverse items-center" style={{ width: '20px' }}>
        {Array.from({ length: chipCount }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-1.5 rounded-full border ${chipColors[i % chipColors.length]}`}
            style={{ marginBottom: i > 0 ? '-2px' : '0' }}
          />
        ))}
      </div>

      {/* Amount label */}
      <span className="text-xs font-bold text-amber-300 bg-gray-900/70 px-1.5 py-0.5 rounded-md border border-gray-700 whitespace-nowrap">
        {formatBB(amount)} BB
      </span>
    </div>
  );
};

export default PlayerBetChips;