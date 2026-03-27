import React, { useState, useCallback } from 'react';

export type BotProfileType = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';

export interface BotSeatConfig {
  seatNumber: number;
  profile: BotProfileType;
}

export interface SessionConfig {
  startingStackBB: 50 | 100 | 200;
  blindLevel: { smallBlind: number; bigBlind: number };
  botSeats: BotSeatConfig[];
}

interface SessionSetupFormProps {
  onStartGame: (config: SessionConfig) => void;
  loading: boolean;
}

const STACK_OPTIONS: { value: 50 | 100 | 200; label: string }[] = [
  { value: 50, label: '50 BB' },
  { value: 100, label: '100 BB' },
  { value: 200, label: '200 BB' },
];

const BLIND_OPTIONS = [
  { sb: 1, bb: 2, label: '1/2' },
  { sb: 2, bb: 5, label: '2/5' },
  { sb: 5, bb: 10, label: '5/10' },
];

const BOT_PROFILES: { value: BotProfileType; label: string; desc: string; emoji: string }[] = [
  { value: 'TAG', label: 'TAG', desc: 'Tight-Aggressive', emoji: '🎯' },
  { value: 'LAG', label: 'LAG', desc: 'Loose-Aggressive', emoji: '🔥' },
  { value: 'Fish', label: 'Fish', desc: 'Loose-Passive', emoji: '🐟' },
  { value: 'Nit', label: 'Nit', desc: 'Ultra-Tight', emoji: '🔒' },
  { value: 'Maniac', label: 'Maniac', desc: 'Hyper-Aggressive', emoji: '💥' },
];

export const SessionSetupForm: React.FC<SessionSetupFormProps> = ({
  onStartGame,
  loading,
}) => {
  const [stackSize, setStackSize] = useState<50 | 100 | 200>(100);
  const [blindIndex, setBlindIndex] = useState(0);
  const [botSeats, setBotSeats] = useState<BotSeatConfig[]>(
    Array.from({ length: 5 }, (_, i) => ({
      seatNumber: i + 1,
      profile: BOT_PROFILES[i % BOT_PROFILES.length].value,
    }))
  );

  const handleBotProfileChange = useCallback((seatIndex: number, profile: BotProfileType) => {
    setBotSeats((prev) =>
      prev.map((seat, i) => (i === seatIndex ? { ...seat, profile } : seat))
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const blind = BLIND_OPTIONS[blindIndex];
    onStartGame({
      startingStackBB: stackSize,
      blindLevel: { smallBlind: blind.sb, bigBlind: blind.bb },
      botSeats,
    });
  }, [stackSize, blindIndex, botSeats, onStartGame]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-50">Session Setup</h2>

      {/* Stack Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Starting Stack</label>
        <div className="flex gap-2">
          {STACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStackSize(opt.value)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                stackSize === opt.value
                  ? 'bg-emerald-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blind Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Blind Level</label>
        <div className="flex gap-2">
          {BLIND_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setBlindIndex(i)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                blindIndex === i
                  ? 'bg-emerald-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bot Seats */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-400">Bot Configuration</label>
        <div className="grid gap-3">
          {botSeats.map((seat, i) => (
            <div
              key={seat.seatNumber}
              className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">
                {seat.seatNumber}
              </div>
              <div className="flex-1">
                <select
                  value={seat.profile}
                  onChange={(e) => handleBotProfileChange(i, e.target.value as BotProfileType)}
                  className="w-full bg-gray-700 text-gray-50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                >
                  {BOT_PROFILES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.emoji} {p.label} — {p.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl text-base font-bold transition-colors ${
          loading
            ? 'bg-emerald-500/50 text-gray-950/50 cursor-not-allowed'
            : 'bg-emerald-500 text-gray-950 hover:bg-emerald-400'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Starting...
          </span>
        ) : (
          'Start Game'
        )}
      </button>
    </div>
  );
};