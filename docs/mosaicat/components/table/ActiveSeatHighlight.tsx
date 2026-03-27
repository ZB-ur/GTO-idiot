import React from 'react';

interface ActiveSeatHighlightProps {
  active: boolean;
}

export const ActiveSeatHighlight: React.FC<ActiveSeatHighlightProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        boxShadow: '0 0 12px 2px rgba(245, 158, 11, 0.5), 0 0 24px 4px rgba(245, 158, 11, 0.25)',
        animation: 'activePulse 2s ease-in-out infinite',
      }}
    >
      <div className="absolute inset-0 rounded-xl border-2 border-amber-500 animate-pulse" />
    </div>
  );
};