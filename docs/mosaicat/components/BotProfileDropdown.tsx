import React from 'react';

type BotProfileType = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';

interface BotProfileDropdownProps {
  value: BotProfileType;
  onChange: (profile: BotProfileType) => void;
}

const PROFILE_META: Record<BotProfileType, { label: string; color: string; desc: string }> = {
  TAG: { label: 'TAG', color: 'text-emerald-400', desc: 'Tight-Aggressive' },
  LAG: { label: 'LAG', color: 'text-sky-400', desc: 'Loose-Aggressive' },
  Fish: { label: 'Fish', color: 'text-amber-400', desc: 'Loose-Passive' },
  Nit: { label: 'Nit', color: 'text-gray-400', desc: 'Very Tight' },
  Maniac: { label: 'Maniac', color: 'text-red-400', desc: 'Ultra-Aggressive' },
};

const PROFILES: BotProfileType[] = ['TAG', 'LAG', 'Fish', 'Nit', 'Maniac'];

export const BotProfileDropdown: React.FC<BotProfileDropdownProps> = ({ value, onChange }) => {
  const meta = PROFILE_META[value];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-400">
        Bot Style
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BotProfileType)}
          className="w-full appearance-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 pr-10 text-base text-gray-50 shadow-sm transition-colors hover:border-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {PROFILES.map((p) => (
            <option key={p} value={p}>
              {p} — {PROFILE_META[p].desc}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
        <span className="text-xs text-gray-500">{meta.desc}</span>
      </div>
    </div>
  );
};

export default BotProfileDropdown;