import React from 'react';

interface Pot {
  amount: number;
  eligibleSeats: number[];
}

interface PotDisplayProps {
  pots: Pot[];
  animate?: boolean;
  className?: string;
}

function formatBB(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(1);
}

export const PotDisplay: React.FC<PotDisplayProps> = ({
  pots,
  animate = false,
  className = '',
}) => {
  const mainPot = pots[0];
  const sidePots = pots.slice(1);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* Main pot */}
      {mainPot && (
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-gradient-to-r from-amber-500 to-yellow-400
            text-white font-bold shadow-md
            ${animate ? 'transition-all duration-500' : ''}
          `}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.3" />
            <circle cx="10" cy="10" r="5" fill="currentColor" />
          </svg>
          <span className="text-lg">{formatBB(mainPot.amount)} BB</span>
        </div>
      )}

      {/* Side pots */}
      {sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((pot, i) => (
            <div
              key={i}
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded-lg
                bg-amber-100 text-amber-800 text-sm font-semibold
                border border-amber-200
                ${animate ? 'transition-all duration-500' : ''}
              `}
            >
              <span className="text-[10px] font-bold text-amber-500">SIDE {i + 1}</span>
              <span>{formatBB(pot.amount)} BB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;