import React from 'react';

interface SidePot {
  amount: number;
  eligibleSeatIndices: number[];
}

interface PotDisplayProps {
  mainPot: number;
  sidePots?: SidePot[];
}

const formatChips = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return amount.toLocaleString();
};

const ChipIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const PotDisplay: React.FC<PotDisplayProps> = ({ mainPot, sidePots }) => {
  const hasSidePots = sidePots && sidePots.length > 0;
  const totalPot = mainPot + (sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Main pot */}
      <div className="flex items-center gap-2 rounded-xl bg-gray-800/80 border border-gray-700 px-4 py-2 shadow-md">
        <ChipIcon className="text-yellow-500" />
        <span className="text-lg font-bold text-gray-50">
          {formatChips(mainPot)}
        </span>
      </div>

      {/* Side pots */}
      {hasSidePots && (
        <div className="flex items-center gap-2">
          {sidePots.map((sp, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg bg-gray-800/60 border border-gray-700/60 px-3 py-1 shadow-sm"
            >
              <ChipIcon className="text-amber-400 w-3 h-3" />
              <span className="text-sm font-semibold text-gray-300">
                {formatChips(sp.amount)}
              </span>
              <span className="text-xs text-gray-500">
                ({sp.eligibleSeatIndices.length})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total label when side pots exist */}
      {hasSidePots && (
        <span className="text-xs text-gray-500">
          Total: {formatChips(totalPot)}
        </span>
      )}
    </div>
  );
};

export default PotDisplay;