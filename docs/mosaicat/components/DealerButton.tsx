import React from 'react';

export const DealerButton: React.FC = () => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center select-none">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-sm" />

      {/* Chip body */}
      <div
        className="relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg"
        style={{
          background: 'linear-gradient(145deg, #fbbf24, #d97706)',
          boxShadow: '0 0 8px rgba(251, 191, 36, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        {/* Inner ring */}
        <div className="absolute inset-1 rounded-full border border-amber-300/40" />

        {/* D letter */}
        <span className="text-xs font-extrabold text-gray-900 relative z-10">D</span>
      </div>
    </div>
  );
};

export default DealerButton;