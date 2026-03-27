import React from 'react';

type BotProfileType = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';

interface BotSeatCardProps {
  seatNumber: number;
  profile: BotProfileType;
  onProfileChange: (profile: BotProfileType) => void;
}

const profileConfig: Record<BotProfileType, { label: string; emoji: string; color: string }> = {
  TAG: { label: 'Tight-Aggressive', emoji: '🎯', color: 'text-sky-400' },
  LAG: { label: 'Loose-Aggressive', emoji: '🔥', color: 'text-orange-400' },
  Fish: { label: 'Fish', emoji: '🐟', color: 'text-emerald-400' },
  Nit: { label: 'Nit', emoji: '🔒', color: 'text-gray-400' },
  Maniac: { label: 'Maniac', emoji: '💥', color: 'text-red-400' },
};

const allProfiles: BotProfileType[] = ['TAG', 'LAG', 'Fish', 'Nit', 'Maniac'];

export const BotSeatCard: React.FC<BotSeatCardProps> = ({
  seatNumber,
  profile,
  onProfileChange,
}) => {
  const config = profileConfig[profile];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-lg">
          {config.emoji}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-50">Seat {seatNumber}</span>
          <span className={`text-xs ${config.color}`}>{config.label}</span>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Bot Profile</label>
        <select
          value={profile}
          onChange={(e) => onProfileChange(e.target.value as BotProfileType)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-50 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
        >
          {allProfiles.map((p) => (
            <option key={p} value={p}>
              {profileConfig[p].emoji} {p} — {profileConfig[p].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};