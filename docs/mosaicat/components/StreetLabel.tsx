import React from 'react';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface StreetLabelProps {
  street: Street;
}

const streetConfig: Record<Street, { label: string; color: string }> = {
  preflop: { label: 'Preflop', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  flop:    { label: 'Flop',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  turn:    { label: 'Turn',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  river:   { label: 'River',   color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export const StreetLabel: React.FC<StreetLabelProps> = ({ street }) => {
  const config = streetConfig[street];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-lg border
        ${config.color}
      `}
    >
      {config.label}
    </span>
  );
};

export default StreetLabel;