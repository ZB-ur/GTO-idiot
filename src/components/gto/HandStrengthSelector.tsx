/**
 * HandStrengthSelector — pill group for selecting a hand strength tier
 * used in the postflop GTO guide.
 */

import React from 'react';
import type { HandStrengthTier } from '../../types/gto';

interface HandStrengthSelectorProps {
  selected: HandStrengthTier;
  onChange: (tier: HandStrengthTier) => void;
  className?: string;
}

const TIERS: { value: HandStrengthTier; label: string; color: string }[] = [
  { value: 'nuts', label: 'Nuts', color: 'bg-red-600' },
  { value: 'strong', label: 'Strong', color: 'bg-orange-600' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-600' },
  { value: 'weak', label: 'Weak', color: 'bg-blue-600' },
  { value: 'air', label: 'Air', color: 'bg-gray-500' },
];

export const HandStrengthSelector: React.FC<HandStrengthSelectorProps> = ({
  selected,
  onChange,
  className = '',
}) => (
  <div className={`flex flex-wrap gap-1.5 ${className}`} role="radiogroup" aria-label="Hand Strength">
    {TIERS.map(({ value, label, color }) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={selected === value}
        onClick={() => onChange(value)}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all
          ${
            selected === value
              ? `${color} text-white shadow-md ring-2 ring-white/30`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default HandStrengthSelector;
