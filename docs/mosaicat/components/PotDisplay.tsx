import React from 'react';

interface SidePot {
  amount: number;
  eligibleSeats: number[];
}

interface PotDisplayProps {
  pot: number;
  sidePots?: SidePot[];
}

const formatChips = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return amount.toLocaleString();
};

const PotDisplay: React.FC<PotDisplayProps> = ({ pot, sidePots }) => {
  const hasSidePots = sidePots && sidePots.length > 0;
  const totalPot = pot + (sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Total pot indicator */}
      {hasSidePots && (
        <div className="text-xs text-gray-400 font-medium tracking-wide uppercase">
          Total: {formatChips(totalPot)}
        </div>
      )}

      {/* Main pot */}
      <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl px-4 py-2 shadow-lg">
        <div className="flex items-center justify-center w-5 h-5">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="8" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="5" stroke="#059669" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
        <span className="text-gray-50 font-bold text-lg tabular-nums">
          {formatChips(pot)}
        </span>
      </div>

      {/* Side pots */}
      {hasSidePots && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {sidePots!.map((sidePot, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-gray-800/70 backdrop-blur-sm border border-gray-700/60 rounded-lg px-3 py-1 shadow-md"
            >
              <div className="flex items-center justify-center w-3.5 h-3.5">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="10" r="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="5" stroke="#ca8a04" strokeWidth="1" opacity="0.5" />
                </svg>
              </div>
              <span className="text-gray-50 font-semibold text-sm tabular-nums">
                {formatChips(sidePot.amount)}
              </span>
              <span className="text-gray-500 text-xs">
                ({sidePot.eligibleSeats.length}p)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;