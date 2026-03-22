import React from 'react';

interface SpeedSelectorProps {
  value: 'fast' | 'normal' | 'slow';
  onChange: (speed: string) => void;
}

const speeds: Array<{ key: 'fast' | 'normal' | 'slow'; label: string; icon: string }> = [
  { key: 'fast', label: 'Fast', icon: '⚡' },
  { key: 'normal', label: 'Normal', icon: '▶' },
  { key: 'slow', label: 'Slow', icon: '🐢' },
];

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-900">Bot Speed</label>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {speeds.map((s) => (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all ${
              value === s.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xs">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};