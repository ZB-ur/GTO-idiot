/**
 * BoardTextureSelector — dropdown for selecting a board texture category
 * used in the postflop GTO guide.
 */

import React from 'react';
import type { BoardTexture } from '../../types/gto';

interface BoardTextureSelectorProps {
  selected: BoardTexture;
  onChange: (texture: BoardTexture) => void;
  className?: string;
}

const TEXTURE_LABELS: Record<BoardTexture, string> = {
  high_rainbow_disconnected: 'High / Rainbow / Disconnected',
  high_rainbow_connected: 'High / Rainbow / Connected',
  high_monotone: 'High / Monotone',
  high_twotone_disconnected: 'High / Two-Tone / Disconnected',
  high_twotone_connected: 'High / Two-Tone / Connected',
  low_rainbow_disconnected: 'Low / Rainbow / Disconnected',
  low_rainbow_connected: 'Low / Rainbow / Connected',
  low_monotone: 'Low / Monotone',
  low_twotone_disconnected: 'Low / Two-Tone / Disconnected',
  low_twotone_connected: 'Low / Two-Tone / Connected',
  mixed_rainbow: 'Mixed / Rainbow',
  mixed_twotone: 'Mixed / Two-Tone',
  mixed_monotone: 'Mixed / Monotone',
};

const ALL_TEXTURES = Object.keys(TEXTURE_LABELS) as BoardTexture[];

export const BoardTextureSelector: React.FC<BoardTextureSelectorProps> = ({
  selected,
  onChange,
  className = '',
}) => (
  <div className={className}>
    <label htmlFor="board-texture" className="mb-1 block text-xs font-medium text-gray-400">
      Board Texture
    </label>
    <select
      id="board-texture"
      value={selected}
      onChange={(e) => onChange(e.target.value as BoardTexture)}
      className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {ALL_TEXTURES.map((t) => (
        <option key={t} value={t}>
          {TEXTURE_LABELS[t]}
        </option>
      ))}
    </select>
  </div>
);

export default BoardTextureSelector;
