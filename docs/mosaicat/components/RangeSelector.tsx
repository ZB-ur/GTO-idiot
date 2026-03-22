import React from 'react';

interface RangeSelectorProps {
  value: number;
  maxHands: number;
  presets?: number[];
  onChange: (count: number) => void;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  value,
  maxHands,
  presets = [50, 100, 200],
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">Analysis Range</label>
        <span className="text-xs text-gray-400">of {maxHands} hands</span>
      </div>
      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(Math.min(p, maxHands))}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${
              value === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
            }`}
          >
            {p}
          </button>
        ))}
        <div className="relative flex-1">
          <input
            type="number"
            min={1}
            max={maxHands}
            value={!presets.includes(value) ? value : ''}
            placeholder="Custom"
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > 0 && v <= maxHands) onChange(v);
            }}
            className="w-full py-2 text-sm font-medium text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};