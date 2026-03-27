import React from 'react';

interface SidePot {
  amount: number;
}

interface PotDisplayProps {
  amount: number;
  sidePots?: SidePot[];
  className?: string;
}

const formatChips = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

export const PotDisplay: React.FC<PotDisplayProps> = ({
  amount,
  sidePots,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* Main pot */}
      <div
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-xl
          bg-gray-900/80 border border-gray-700
          shadow-lg shadow-black/40 backdrop-blur-sm
        "
      >
        <span className="text-base">🪙</span>
        <span className="text-lg font-bold tabular-nums text-amber-400 tracking-tight">
          {formatChips(amount)}
        </span>
      </div>

      {/* Side pots */}
      {sidePots && sidePots.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {sidePots.map((pot, i) => (
            <div
              key={i}
              className="
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                bg-gray-800/80 border border-gray-700
                shadow-md shadow-black/30
              "
            >
              <span className="text-xs text-gray-500 font-medium">Side</span>
              <span className="text-sm font-bold tabular-nums text-amber-300">
                {formatChips(pot.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;