import React from 'react';

interface SidePot {
  amount: number;
  eligiblePlayers: number[];
}

interface PotDisplayProps {
  mainPot: number;
  sidePots?: SidePot[];
  totalPot: number;
}

function formatBB(amount: number): string {
  if (Number.isInteger(amount)) return `${amount}`;
  return amount.toFixed(1);
}

export const PotDisplay: React.FC<PotDisplayProps> = ({
  mainPot,
  sidePots = [],
  totalPot,
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Total pot */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-700 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <span className="text-amber-400 text-lg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.3" />
              <text x="10" y="14" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">$</text>
            </svg>
          </span>
          <span className="text-white font-bold text-lg tracking-tight">
            {formatBB(totalPot)} BB
          </span>
        </div>
      </div>

      {/* Pot breakdown (when side pots exist) */}
      {sidePots.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs font-medium text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-lg border border-gray-700">
            Main: {formatBB(mainPot)} BB
          </span>
          {sidePots.map((sp, i) => (
            <span
              key={i}
              className="text-xs font-medium text-amber-300 bg-gray-800/60 px-2 py-0.5 rounded-lg border border-gray-700"
            >
              Side {i + 1}: {formatBB(sp.amount)} BB
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;