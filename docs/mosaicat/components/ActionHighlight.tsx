import React from 'react';

interface ActionHighlightProps {
  active: boolean;
  className?: string;
}

export const ActionHighlight: React.FC<ActionHighlightProps> = ({ active, className = '' }) => {
  if (!active) return null;

  return (
    <div
      className={`absolute inset-0 rounded-xl border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)] animate-pulse pointer-events-none ${className}`}
    />
  );
};