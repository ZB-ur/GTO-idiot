import React from 'react';

interface PotDisplayProps {
  amount: number;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ amount }) => {
  const formattedAmount = amount.toLocaleString();

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl scale-150" />

      {/* Pot chip + amount */}
      <div className="relative flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-700/50 shadow-lg">
        {/* Chip icon */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600 flex items-center justify-center shadow-md">
          <div className="w-3 h-3 rounded-full border border-amber-200/60" />
        </div>

        {/* Amount */}
        <span className="text-amber-400 font-bold text-lg tabular-nums tracking-tight">
          {formattedAmount}
        </span>
      </div>
    </div>
  );
};

export default PotDisplay;