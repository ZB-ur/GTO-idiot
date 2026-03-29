import React from 'react';

export interface SidePot {
  amount: number;
  eligiblePlayers: number[];
}

export interface PotDisplayProps {
  mainPot: number;
  sidePots?: SidePot[];
}

function formatChips(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return amount.toLocaleString();
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ mainPot, sidePots }) => {
  const totalPot = mainPot + (sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0);
  const hasSidePots = sidePots && sidePots.length > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Total pot label */}
      <div className="text-xs font-medium text-emerald-300/70 uppercase tracking-wider">
        Total Pot
      </div>

      {/* Main pot chip display */}
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-emerald-500/20">
        {/* Chip icon stack */}
        <div className="relative w-5 h-5 flex-shrink-0">
          <div className="absolute bottom-0 left-0 w-5 h-1.5 rounded-full bg-amber-400 border border-amber-500" />
          <div className="absolute bottom-1 left-0 w-5 h-1.5 rounded-full bg-amber-300 border border-amber-400" />
          <div className="absolute bottom-2 left-0 w-5 h-1.5 rounded-full bg-yellow-300 border border-yellow-400" />
        </div>
        <span className="text-lg font-bold text-yellow-300 tabular-nums">
          {formatChips(totalPot)}
        </span>
      </div>

      {/* Pot breakdown (when side pots exist) */}
      {hasSidePots && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-0.5">
          {/* Main pot badge */}
          <div className="flex items-center gap-1 bg-black/30 rounded-full px-2.5 py-0.5 border border-emerald-600/30">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs font-medium text-gray-200">
              Main: {formatChips(mainPot)}
            </span>
          </div>

          {/* Side pot badges */}
          {sidePots!.map((sp, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-black/30 rounded-full px-2.5 py-0.5 border border-blue-500/30"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-gray-200">
                Side {idx + 1}: {formatChips(sp.amount)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({sp.eligiblePlayers.length}p)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;