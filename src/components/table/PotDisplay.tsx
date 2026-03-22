/**
 * PotDisplay — shows the main pot and any side pots at the center of the table.
 */

import React from 'react';
import type { PotInfo } from '../../types';

interface PotDisplayProps {
  pot: PotInfo;
  className?: string;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pot, className = '' }) => {
  const totalPot =
    pot.mainPot + (pot.sidePots?.reduce((sum, sp) => sum + sp.amount, 0) ?? 0);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Main pot */}
      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border border-yellow-500 flex items-center justify-center">
          <span className="text-[0.45rem] font-bold text-yellow-900">$</span>
        </div>
        <span className="text-white font-bold text-sm tabular-nums">
          {totalPot.toFixed(0)} BB
        </span>
      </div>

      {/* Side pots */}
      {pot.sidePots && pot.sidePots.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center">
          {pot.sidePots.map((sp, i) => (
            <div
              key={i}
              className="text-[0.65rem] bg-black/30 text-yellow-300 rounded-full px-2 py-0.5"
            >
              Side #{i + 1}: {sp.amount.toFixed(0)} BB
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PotDisplay;
