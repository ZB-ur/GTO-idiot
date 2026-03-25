import React from 'react';

interface ActionIndicatorProps {
  active: boolean;
}

const ActionIndicator: React.FC<ActionIndicatorProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 rounded-full pointer-events-none">
      <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-pulse" />
      <div className="absolute -inset-1 rounded-full border border-emerald-500/40 animate-ping" style={{ animationDuration: '1.5s' }} />
    </div>
  );
};

export default ActionIndicator;