import React from 'react';

type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface PositionBadgeProps {
  position: Position;
}

const POSITION_STYLES: Record<Position, { bg: string; text: string; border: string }> = {
  UTG: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  MP:  { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  CO:  { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
  BTN: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  SB:  { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/40' },
  BB:  { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/40' },
};

export const PositionBadge: React.FC<PositionBadgeProps> = ({ position }) => {
  const style = POSITION_STYLES[position];

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold tracking-wider rounded ${style.bg} ${style.text} border ${style.border}`}
    >
      {position}
    </span>
  );
};

export default PositionBadge;