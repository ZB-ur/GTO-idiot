import React from 'react';

export interface PotDisplayProps {
  amount: number;
  sidePots?: { amount: number }[];
}

function formatChips(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

const PotDisplay: React.FC<PotDisplayProps> = ({ amount, sidePots }) => {
  if (amount <= 0 && (!sidePots || sidePots.length === 0)) return null;

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Pot: ${amount}`}>
      {/* Main pot */}
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-yellow-600/30">
        <div className="flex -space-x-1">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-red-500 border border-red-700 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-700 shadow-sm" />
        </div>
        <span className="text-sm font-bold text-yellow-300 tracking-wide">
          {formatChips(amount)}
        </span>
      </div>

      {/* Side pots */}
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((sp, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-black/40 rounded-full px-2.5 py-0.5 border border-slate-500/30"
            >
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600 shadow-sm" />
              <span className="text-xs font-semibold text-green-300">
                Side {i + 1}: {formatChips(sp.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;
