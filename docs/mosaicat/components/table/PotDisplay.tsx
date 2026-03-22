import React from 'react';

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotInfo {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
}

interface PotDisplayProps {
  pot: PotInfo;
  animate?: boolean;
}

function ChipStack({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const chipClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex flex-col-reverse items-center gap-[-2px]">
      <div className={`${chipClasses} rounded-full bg-gradient-to-b from-red-400 to-red-600 border border-red-700 shadow-sm`} />
      <div className={`${chipClasses} rounded-full bg-gradient-to-b from-blue-400 to-blue-600 border border-blue-700 shadow-sm -mb-1.5`} />
      <div className={`${chipClasses} rounded-full bg-gradient-to-b from-green-400 to-green-600 border border-green-700 shadow-sm -mb-1.5`} />
    </div>
  );
}

function formatChips(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pot, animate = false }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main Pot */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-emerald-500/30 shadow-lg
          ${animate ? 'animate-pulse' : ''}
        `}
      >
        <ChipStack size="md" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-medium">
            Pot
          </span>
          <span className="text-lg font-bold text-amber-300">
            {formatChips(pot.totalPot)} BB
          </span>
        </div>
        <ChipStack size="md" />
      </div>

      {/* Side Pots */}
      {pot.sidePots.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {pot.sidePots.map((sidePot, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/30 backdrop-blur-sm border border-emerald-600/20"
            >
              <ChipStack size="sm" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-emerald-300/60 font-medium">
                  Side {index + 1}
                </span>
                <span className="text-sm font-semibold text-amber-200">
                  {formatChips(sidePot.amount)} BB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;