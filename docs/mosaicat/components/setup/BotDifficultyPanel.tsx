import React from 'react';
import { BotSeatConfig } from './BotSeatConfig';
import { SetAllDropdown } from './SetAllDropdown';

interface BotDifficultyPanelProps {
  bots: Array<{ seatIndex: number; difficulty: string }>;
  onChange: (seatIndex: number, difficulty: string) => void;
  onSetAll: (difficulty: string) => void;
}

export const BotDifficultyPanel: React.FC<BotDifficultyPanelProps> = ({
  bots,
  onChange,
  onSetAll,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Bot Opponents</h3>
        <SetAllDropdown onChange={onSetAll} />
      </div>

      {/* Bot seats */}
      <div className="flex justify-center gap-3 flex-wrap">
        {bots.map((bot) => (
          <BotSeatConfig
            key={bot.seatIndex}
            seatIndex={bot.seatIndex}
            difficulty={bot.difficulty}
            onChange={(d) => onChange(bot.seatIndex, d)}
          />
        ))}
      </div>
    </div>
  );
};

export default BotDifficultyPanel;