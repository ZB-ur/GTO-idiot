// ============================================================
// PotDisplay — Shows main pot and side pots at the table center
// ============================================================

import React from 'react';
import type { Pot } from '../../types';
import { fadeInClass } from './animations';

export interface PotDisplayProps {
  pots: Pot[];
  animate?: boolean;
}

const PotDisplay: React.FC<PotDisplayProps> = ({ pots, animate = true }) => {
  const totalPot = pots.reduce((sum, p) => sum + p.amount, 0);

  if (totalPot === 0) return null;

  return (
    <div className={`flex flex-col items-center gap-1 ${fadeInClass(animate)}`}>
      {/* Main pot */}
      <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full">
        <span className="text-yellow-400 text-sm">🏆</span>
        <span className="text-white font-bold text-sm">
          {totalPot.toFixed(1)} BB
        </span>
      </div>

      {/* Side pots */}
      {pots.length > 1 && (
        <div className="flex gap-2">
          {pots.map((pot, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full"
            >
              <span className="text-gray-400 text-[10px]">
                {i === 0 ? 'Main' : `Side ${i}`}
              </span>
              <span className="text-gray-200 text-xs font-mono">
                {pot.amount.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(PotDisplay);
