import React from 'react';

interface SidePotDisplayProps {
  amount: number;
  eligiblePlayers: number[];
  potIndex: number;
}

const SidePotDisplay: React.FC<SidePotDisplayProps> = ({ amount, eligiblePlayers, potIndex }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-900/80 border border-emerald-700/50 px-3 py-1.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-emerald-300/70 uppercase tracking-wide">
          Side Pot {potIndex}
        </span>
        <span className="text-sm font-bold text-amber-400">
          {amount.toLocaleString()}
        </span>
      </div>
      <div className="h-4 w-px bg-emerald-700/50" />
      <div className="flex -space-x-1.5">
        {eligiblePlayers.map((playerId) => (
          <div
            key={playerId}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 border border-emerald-600 text-[10px] font-semibold text-emerald-100"
          >
            {playerId}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidePotDisplay;