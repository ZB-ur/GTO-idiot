import { useState } from 'react';
import type { RaisePreset } from '../../types/game';

interface RaiseSliderProps {
  readonly min: number;
  readonly max: number;
  readonly presets?: readonly RaisePreset[];
  readonly onConfirm: (amount: number) => void;
  readonly onCancel: () => void;
}

export function RaiseSlider({ min, max, presets, onConfirm, onCancel }: RaiseSliderProps) {
  const [value, setValue] = useState(min);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-600 bg-gray-800 p-3">
      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-gray-400">{min.toFixed(1)}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-600 accent-felt-500"
        />
        <span className="font-mono text-xs text-gray-400">{max.toFixed(1)}</span>
      </div>

      {/* Current value */}
      <div className="text-center font-mono text-lg font-bold text-white">{value.toFixed(1)} BB</div>

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setValue(Math.min(p.amount, max))}
              className="rounded bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Confirm / Cancel */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-lg bg-gray-700 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600">
          Cancel
        </button>
        <button onClick={() => onConfirm(value)} className="btn-primary flex-1 py-2 text-sm">
          Raise {value.toFixed(1)}
        </button>
      </div>
    </div>
  );
}
