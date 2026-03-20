import React from 'react';

interface SidePot {
  amount: number;
  eligibleSeats: number[];
}

interface PotDisplayProps {
  mainPot: number;
  sidePots?: SidePot[];
  totalPot: number;
}

const formatChips = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toFixed(1);
};

const PotDisplay: React.FC<PotDisplayProps> = ({ mainPot, sidePots, totalPot }) => {
  const hasSidePots = sidePots && sidePots.length > 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Total pot label */}
      <div className="text-gray-300 text-xs font-medium tracking-wide uppercase">
        Total Pot
      </div>

      {/* Total pot amount */}
      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-amber-400/30 shadow-lg shadow-black/30">
        <svg
          className="w-4 h-4 text-amber-400 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <circle cx="10" cy="10" r="8" />
          <text
            x="10"
            y="14"
            textAnchor="middle"
            fontSize="10"
            fill="#1a1a1a"
            fontWeight="bold"
          >
            $
          </text>
        </svg>
        <span className="text-amber-400 text-lg font-bold tabular-nums">
          {formatChips(totalPot)} BB
        </span>
      </div>

      {/* Pot breakdown */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Main pot chip stack */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg px-2.5 py-1 border border-gray-600/40">
          <div className="flex flex-col items-center gap-px">
            <div className="w-3.5 h-1 rounded-sm bg-amber-400 shadow-sm" />
            <div className="w-3.5 h-1 rounded-sm bg-amber-500 shadow-sm" />
            <div className="w-3.5 h-1 rounded-sm bg-amber-600 shadow-sm" />
          </div>
          <div className="flex flex-col items-start ml-0.5">
            <span className="text-gray-400 text-[10px] leading-tight">Main</span>
            <span className="text-white text-xs font-semibold tabular-nums">
              {formatChips(mainPot)}
            </span>
          </div>
        </div>

        {/* Side pots */}
        {hasSidePots &&
          sidePots.map((sp, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-black/30 rounded-lg px-2.5 py-1 border border-gray-600/40"
            >
              <div className="flex flex-col items-center gap-px">
                <div className="w-3.5 h-1 rounded-sm bg-emerald-400 shadow-sm" />
                <div className="w-3.5 h-1 rounded-sm bg-emerald-500 shadow-sm" />
              </div>
              <div className="flex flex-col items-start ml-0.5">
                <span className="text-gray-400 text-[10px] leading-tight">
                  Side {sidePots.length > 1 ? idx + 1 : ''}
                </span>
                <span className="text-white text-xs font-semibold tabular-nums">
                  {formatChips(sp.amount)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PotDisplay;