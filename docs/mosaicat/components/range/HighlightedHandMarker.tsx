import React from 'react';

interface HighlightedHandMarkerProps {
  hand: string;
}

export const HighlightedHandMarker: React.FC<HighlightedHandMarkerProps> = ({ hand }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      aria-label={`Highlighted hand: ${hand}`}
    >
      {/* Pulsing ring */}
      <div className="absolute inset-0 rounded-sm ring-2 ring-amber-400 ring-offset-1 animate-pulse" />
      {/* Corner badge */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm" />
    </div>
  );
};

export default HighlightedHandMarker;