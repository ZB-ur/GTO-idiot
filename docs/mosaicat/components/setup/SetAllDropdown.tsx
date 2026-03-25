import React from 'react';

const DIFFICULTIES = [
  { value: 'fish', label: '🐟 Fish', description: 'Beginner' },
  { value: 'regular', label: '🎯 Regular', description: 'Intermediate' },
  { value: 'gto', label: '🧠 GTO', description: 'Advanced' },
] as const;

interface SetAllDropdownProps {
  onChange: (value: string) => void;
}

export const SetAllDropdown: React.FC<SetAllDropdownProps> = ({ onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-500 whitespace-nowrap">
        Set All Bots:
      </label>
      <select
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
            e.target.value = '';
          }
        }}
        defaultValue=""
        className="w-44 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
                   text-gray-900 shadow-sm cursor-pointer
                   hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                   transition-colors"
      >
        <option value="" disabled>
          Choose difficulty…
        </option>
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label} — {d.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SetAllDropdown;