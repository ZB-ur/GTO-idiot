import React from 'react';
import { ChipStack } from './ChipStack';

interface SidePot {
  amount: number;
  eligible: string[];
}

interface PotDisplayProps {
  mainPot: number;
  sidePots?: SidePot[];
  animate?: boolean;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({
  mainPot,
  sidePots,
  animate = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 ${
          animate ? 'animate-pulse' : ''
        }`}
      >
        <ChipStack amount={mainPot} size="sm" />
        <span className="text-yellow-400 font-bold text-sm">
          ${mainPot.toLocaleString()}
        </span>
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((sp, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-black/20 rounded-md px-2 py-0.5"
            >
              <span className="text-yellow-300/80 text-xs font-medium">
                Side ${sp.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};