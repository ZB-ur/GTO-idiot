import React from 'react';

interface TurnIndicatorProps {
  isActive: boolean;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="pointer-events-none absolute inset-0 rounded-xl">
      <div className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
      <div className="absolute -inset-0.5 rounded-xl bg-amber-400/10 animate-pulse" />
    </div>
  );
};

export default TurnIndicator;