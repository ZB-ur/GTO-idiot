import React from 'react';

type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface PositionLabelProps {
  position: Position;
}

const positionColors: Record<Position, string> = {
  UTG: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  MP: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  CO: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  BTN: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  SB: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  BB: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const PositionLabel: React.FC<PositionLabelProps> = ({ position }) => {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${positionColors[position]}`}
    >
      {position}
    </span>
  );
};

export default PositionLabel;