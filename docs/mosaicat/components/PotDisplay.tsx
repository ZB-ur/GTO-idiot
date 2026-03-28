import React from 'react';

interface Pot {
  amount: number;
  label?: string;
}

interface PotDisplayProps {
  pots: Pot[];
  className?: string;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pots, className = '' }) => {
  if (pots.length === 0) return null;

  const mainPot = pots[0];
  const sidePots = pots.slice(1);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl px-4 py-2 text-center">
        <span className="text-gray-400 text-xs uppercase tracking-wider">
          {mainPot.label || 'Pot'}
        </span>
        <div className="text-amber-400 font-bold text-xl tabular-nums">
          {mainPot.amount.toLocaleString()}
        </div>
      </div>
      {sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((pot, idx) => (
            <div
              key={idx}
              className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-1 text-center"
            >
              <span className="text-gray-500 text-xs">
                {pot.label || `Side ${idx + 1}`}
              </span>
              <div className="text-amber-400/80 font-semibold text-sm tabular-nums">
                {pot.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};