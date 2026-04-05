import React from 'react';

type CardSize = 'sm' | 'md' | 'lg';

interface CardBackProps {
  size?: CardSize;
}

const SIZE_MAP: Record<CardSize, { w: string; h: string }> = {
  sm: { w: 'w-10', h: 'h-14' },
  md: { w: 'w-14', h: 'h-20' },
  lg: { w: 'w-20', h: 'h-28' },
};

export const CardBack: React.FC<CardBackProps> = ({ size = 'md' }) => {
  const s = SIZE_MAP[size];

  return (
    <div
      className={`${s.w} ${s.h} rounded-lg shadow-md border border-gray-700 overflow-hidden relative`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Diamond lattice pattern via SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 56"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="cardPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="40" height="56" fill="url(#cardPattern)" />
      </svg>

      {/* Inner border */}
      <div className="absolute inset-1 rounded border border-amber-600/30" />

      {/* Center ornament */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border border-amber-500/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500/40" />
        </div>
      </div>
    </div>
  );
};

export default CardBack;