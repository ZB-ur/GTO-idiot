import React from 'react';

const DIFFICULTIES = [
  { value: 'fish', label: '🐟 Fish', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'regular', label: '🎯 Regular', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'gto', label: '🧠 GTO', color: 'bg-red-100 text-red-700 border-red-200' },
] as const;

const AVATAR_STYLES: Record<string, { bg: string; emoji: string }> = {
  fish: { bg: 'bg-emerald-500', emoji: '🐟' },
  regular: { bg: 'bg-amber-500', emoji: '🎯' },
  gto: { bg: 'bg-red-500', emoji: '🧠' },
};

interface BotSeatConfigProps {
  seatIndex: number;
  difficulty: string;
  onChange: (difficulty: string) => void;
}

export const BotSeatConfig: React.FC<BotSeatConfigProps> = ({
  seatIndex,
  difficulty,
  onChange,
}) => {
  const avatar = AVATAR_STYLES[difficulty] ?? AVATAR_STYLES.fish;

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[120px]">
      {/* Avatar */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${avatar.bg} text-white shadow-sm`}
      >
        {avatar.emoji}
      </div>

      {/* Label */}
      <span className="text-xs font-medium text-gray-500">Bot {seatIndex}</span>

      {/* Dropdown */}
      <select
        value={difficulty}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg
                   text-gray-900 cursor-pointer
                   hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                   transition-colors text-center"
      >
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BotSeatConfig;