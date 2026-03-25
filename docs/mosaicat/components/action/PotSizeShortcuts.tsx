import React from 'react';

interface PotSizeShortcutsProps {
  potSize: number;
  onSelect: (amount: number) => void;
}

const shortcuts = [
  { label: '1/3', fraction: 1 / 3 },
  { label: '1/2', fraction: 1 / 2 },
  { label: '2/3', fraction: 2 / 3 },
  { label: 'Pot', fraction: 1 },
];

export const PotSizeShortcuts: React.FC<PotSizeShortcutsProps> = ({ potSize, onSelect }) => {
  return (
    <div className="flex items-center gap-2">
      {shortcuts.map((s) => {
        const amount = Math.round(potSize * s.fraction);
        return (
          <button
            key={s.label}
            type="button"
            onClick={() => onSelect(amount)}
            className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export default PotSizeShortcuts;