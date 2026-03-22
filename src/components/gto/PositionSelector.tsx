/**
 * PositionSelector — horizontal pill-group for selecting a table position.
 */

import React from 'react';
import type { Position } from '../../types/poker';
import { POSITIONS } from '../../types/index';

interface PositionSelectorProps {
  selected: Position;
  onChange: (position: Position) => void;
  className?: string;
}

const POSITION_LABELS: Record<Position, string> = {
  UTG: 'UTG',
  HJ: 'HJ',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selected,
  onChange,
  className = '',
}) => (
  <div className={`flex flex-wrap gap-1.5 ${className}`} role="radiogroup" aria-label="Position">
    {POSITIONS.map((pos) => (
      <button
        key={pos}
        type="button"
        role="radio"
        aria-checked={selected === pos}
        onClick={() => onChange(pos)}
        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors
          ${
            selected === pos
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
      >
        {POSITION_LABELS[pos]}
      </button>
    ))}
  </div>
);

export default PositionSelector;
