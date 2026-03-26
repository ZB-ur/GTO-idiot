import React from 'react';

export interface SidePot {
  amount: number;
  eligiblePlayerIndices: number[];
}

export interface PotDisplayProps {
  potTotal: number;
  sidePots?: SidePot[];
}

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ potTotal, sidePots }) => {
  const hasSidePots = sidePots && sidePots.length > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Main pot */}
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-5 py-2 border border-amber-500/30 shadow-lg">
        <svg
          className="w-4 h-4 text-amber-400 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#000"
          >
            $
          </text>
        </svg>
        <span className="text-amber-400 font-bold text-lg tracking-wide tabular-nums">
          {formatChips(potTotal)}
        </span>
      </div>

      {/* Side pots */}
      {hasSidePots && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {sidePots.map((sp, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-500/30"
            >
              <span className="text-gray-400 text-xs font-medium">
                边池{sidePots.length > 1 ? ` ${idx + 1}` : ''}
              </span>
              <span className="text-amber-300 text-sm font-semibold tabular-nums">
                {formatChips(sp.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;