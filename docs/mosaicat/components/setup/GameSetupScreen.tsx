import React, { useState, useCallback } from 'react';

export type BotDifficulty = 'fish' | 'regular' | 'gto';

export interface BotConfig {
  seatIndex: number;
  name: string;
  difficulty: BotDifficulty;
}

export interface GameConfig {
  startingChips: number;
  blinds: { small: number; big: number };
  bots: BotConfig[];
  heroName: string;
  heroSeatIndex: number;
}

interface GameSetupScreenProps {
  onStartGame: (config: GameConfig) => void;
}

const DEFAULT_BOTS: BotConfig[] = [
  { seatIndex: 1, name: 'Bot 1', difficulty: 'fish' },
  { seatIndex: 2, name: 'Bot 2', difficulty: 'fish' },
  { seatIndex: 3, name: 'Bot 3', difficulty: 'regular' },
  { seatIndex: 4, name: 'Bot 4', difficulty: 'regular' },
  { seatIndex: 5, name: 'Bot 5', difficulty: 'gto' },
];

const DIFFICULTY_META: Record<BotDifficulty, { label: string; color: string; icon: string; description: string }> = {
  fish: { label: 'Fish', color: 'emerald', icon: '🐟', description: 'Loose, passive play. Calls too much, rarely bluffs.' },
  regular: { label: 'Regular', color: 'amber', icon: '♠️', description: 'Solid fundamentals. Balanced ranges, standard plays.' },
  gto: { label: 'GTO', color: 'red', icon: '🧠', description: 'Near-optimal strategy. Exploits mistakes ruthlessly.' },
};

const CHIP_PRESETS = [100, 200, 500, 1000];
const BLIND_PRESETS = [
  { small: 1, big: 2 },
  { small: 2, big: 5 },
  { small: 5, big: 10 },
  { small: 10, big: 20 },
];

const SEAT_POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const;

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({ onStartGame }) => {
  const [startingChips, setStartingChips] = useState(200);
  const [blinds, setBlinds] = useState({ small: 1, big: 2 });
  const [bots, setBots] = useState<BotConfig[]>(DEFAULT_BOTS);
  const [heroName] = useState('Hero');

  const updateBotDifficulty = useCallback((seatIndex: number, difficulty: BotDifficulty) => {
    setBots(prev => prev.map(b => b.seatIndex === seatIndex ? { ...b, difficulty } : b));
  }, []);

  const handleStart = useCallback(() => {
    onStartGame({
      startingChips,
      blinds,
      bots,
      heroName,
      heroSeatIndex: 0,
    });
  }, [startingChips, blinds, bots, heroName, onStartGame]);

  const difficultyBreakdown = bots.reduce<Record<BotDifficulty, number>>(
    (acc, b) => ({ ...acc, [b.difficulty]: (acc[b.difficulty] || 0) + 1 }),
    { fish: 0, regular: 0, gto: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Game Setup</h1>
          <p className="text-gray-500">Configure your table before jumping in</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bot Difficulty Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bot Difficulty</h2>
              <div className="space-y-3">
                {bots.map(bot => {
                  const pos = SEAT_POSITIONS[bot.seatIndex];
                  return (
                    <div key={bot.seatIndex} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-semibold text-gray-400 w-8">{pos}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{bot.name}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {(Object.keys(DIFFICULTY_META) as BotDifficulty[]).map(diff => {
                          const meta = DIFFICULTY_META[diff];
                          const isActive = bot.difficulty === diff;
                          const colorMap: Record<string, string> = {
                            emerald: isActive ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                            amber: isActive ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                            red: isActive ? 'bg-red-100 border-red-400 text-red-800' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                          };
                          return (
                            <button
                              key={diff}
                              onClick={() => updateBotDifficulty(bot.seatIndex, diff)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${colorMap[meta.color]}`}
                              title={meta.description}
                            >
                              {meta.icon} {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Difficulty summary */}
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                {(Object.keys(DIFFICULTY_META) as BotDifficulty[]).map(d => (
                  <span key={d}>{DIFFICULTY_META[d].icon} {difficultyBreakdown[d]} {DIFFICULTY_META[d].label}</span>
                ))}
              </div>
            </div>

            {/* Game Settings Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Game Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Starting Chips */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Starting Chips</label>
                  <div className="flex flex-wrap gap-2">
                    {CHIP_PRESETS.map(val => (
                      <button
                        key={val}
                        onClick={() => setStartingChips(val)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          startingChips === val
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Blinds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blinds</label>
                  <div className="flex flex-wrap gap-2">
                    {BLIND_PRESETS.map(b => {
                      const isActive = blinds.small === b.small && blinds.big === b.big;
                      return (
                        <button
                          key={`${b.small}/${b.big}`}
                          onClick={() => setBlinds(b)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            isActive
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {b.small}/{b.big}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview + Start */}
          <div className="space-y-6">
            {/* Mini Table Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Preview</h2>
              <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                {/* Felt */}
                <div className="absolute inset-4 rounded-full bg-emerald-800 border-4 border-emerald-900 shadow-inner flex items-center justify-center">
                  <span className="text-emerald-600 text-xs font-medium">GTO Idiot</span>
                </div>
                {/* Seats around the table */}
                {[0, ...bots.map(b => b.seatIndex)].map((seatIdx, i) => {
                  const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
                  const radius = 44;
                  const left = 50 + radius * Math.cos(angle);
                  const top = 50 + radius * Math.sin(angle);
                  const isHero = seatIdx === 0;
                  const bot = bots.find(b => b.seatIndex === seatIdx);
                  const diff = isHero ? null : bot?.difficulty;
                  const bgColor = isHero
                    ? 'bg-blue-600'
                    : diff === 'fish' ? 'bg-emerald-500' : diff === 'regular' ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div
                      key={seatIdx}
                      className={`absolute w-9 h-9 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white`}
                      style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                      title={isHero ? 'Hero' : `${bot?.name} (${diff})`}
                    >
                      {isHero ? 'H' : SEAT_POSITIONS[seatIdx].slice(0, 2)}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Hero</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Fish</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Reg</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> GTO</span>
              </div>
            </div>

            {/* Config Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Players</span><span className="font-medium text-gray-900">6 (1 hero + 5 bots)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Starting Chips</span><span className="font-medium text-gray-900">{startingChips}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Blinds</span><span className="font-medium text-gray-900">{blinds.small}/{blinds.big}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Effective BBs</span><span className="font-medium text-gray-900">{Math.floor(startingChips / blinds.big)} BB</span></div>
              </div>
            </div>

            {/* Start Game Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Game →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetupScreen;