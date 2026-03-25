import React from 'react';

const BLIND_LEVELS = [
  { value: '1/2', label: '1 / 2' },
  { value: '2/5', label: '2 / 5' },
  { value: '5/10', label: '5 / 10' },
] as const;

const STACK_SIZES = [
  { value: '100bb', label: '100 BB' },
  { value: '200bb', label: '200 BB' },
] as const;

const GAME_SPEEDS = [
  { value: 'slow', label: 'Slow', icon: '🐢' },
  { value: 'normal', label: 'Normal', icon: '▶️' },
  { value: 'fast', label: 'Fast', icon: '⚡' },
] as const;

interface GameSettingsPanelProps {
  blindLevel: string;
  stackSize: string;
  gameSpeed: string;
  onBlindChange: (value: string) => void;
  onStackChange: (value: string) => void;
  onSpeedChange: (value: string) => void;
}

export const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({
  blindLevel,
  stackSize,
  gameSpeed,
  onBlindChange,
  onStackChange,
  onSpeedChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Game Settings</h3>

      {/* Blind Level */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Blind Level</label>
        <div className="flex gap-2">
          {BLIND_LEVELS.map((bl) => (
            <button
              key={bl.value}
              onClick={() => onBlindChange(bl.value)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${
                  blindLevel === bl.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              {bl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stack Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Starting Stack</label>
        <div className="flex gap-2">
          {STACK_SIZES.map((ss) => (
            <button
              key={ss.value}
              onClick={() => onStackChange(ss.value)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${
                  stackSize === ss.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              {ss.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Speed */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Bot Speed</label>
        <div className="flex gap-2">
          {GAME_SPEEDS.map((gs) => (
            <button
              key={gs.value}
              onClick={() => onSpeedChange(gs.value)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors
                ${
                  gameSpeed === gs.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <span className="mr-1.5">{gs.icon}</span>
              {gs.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSettingsPanel;