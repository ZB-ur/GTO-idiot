import React from 'react';

interface SidePot {
  amount: number;
  eligiblePlayers: number[];
}

interface PotDisplayProps {
  main: number;
  sidePots?: SidePot[];
  total: number;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ main, sidePots, total }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-center">
        <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Pot</div>
        <div className="text-white text-xl font-bold font-mono">{total.toLocaleString()}</div>
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2 mt-1">
          <div className="px-2 py-1 bg-black/40 rounded-lg text-center">
            <div className="text-gray-400 text-[10px] uppercase">Main</div>
            <div className="text-white text-sm font-mono">{main.toLocaleString()}</div>
          </div>
          {sidePots.map((sp, i) => (
            <div key={i} className="px-2 py-1 bg-black/40 rounded-lg text-center">
              <div className="text-gray-400 text-[10px] uppercase">Side {i + 1}</div>
              <div className="text-white text-sm font-mono">{sp.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;