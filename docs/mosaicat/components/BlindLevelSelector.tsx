import React from 'react';

interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
}

interface BlindLevelSelectorProps {
  value: BlindLevel;
  onChange: (value: BlindLevel) => void;
}

const BLIND_OPTIONS: BlindLevel[] = [
  { smallBlind: 1, bigBlind: 2 },
  { smallBlind: 2, bigBlind: 5 },
  { smallBlind: 5, bigBlind: 10 },
];

const formatBlind = (bl: BlindLevel) => `${bl.smallBlind}/${bl.bigBlind}`;

export const BlindLevelSelector: React.FC<BlindLevelSelectorProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    onChange(BLIND_OPTIONS[idx]);
  };

  const selectedIdx = BLIND_OPTIONS.findIndex(
    (opt) => opt.smallBlind === value.smallBlind && opt.bigBlind === value.bigBlind,
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-400">
        Blind Level
      </label>
      <div className="relative">
        <select
          value={selectedIdx}
          onChange={handleChange}
          className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 pr-10 text-base text-gray-50 shadow-sm transition-colors hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {BLIND_OPTIONS.map((opt, idx) => (
            <option key={idx} value={idx}>
              {formatBlind(opt)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <span className="text-xs text-gray-500">
        Small Blind: {value.smallBlind} · Big Blind: {value.bigBlind}
      </span>
    </div>
  );
};

export default BlindLevelSelector;