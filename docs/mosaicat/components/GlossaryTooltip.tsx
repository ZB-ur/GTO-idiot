import React from 'react';

interface GlossaryTooltipProps {
  term: string;
  fullName: string;
  definition: string;
  visible: boolean;
  position: { x: number; y: number };
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({
  term,
  fullName,
  definition,
  visible,
  position,
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md transition-opacity duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
      }}
      role="tooltip"
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-emerald-400 font-semibold text-sm">{term}</span>
        <span className="text-gray-500 text-xs">{fullName}</span>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{definition}</p>
      {/* Arrow */}
      <div
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 rotate-45"
      />
    </div>
  );
};