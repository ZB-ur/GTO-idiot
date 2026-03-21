import React, { useState, useCallback, useMemo } from 'react';

type BotDifficulty = 'fish' | 'regular' | 'gto';

interface BotConfig {
  name: string;
  difficulty: BotDifficulty;
}

interface BlindsConfig {
  small_blind: number;
  big_blind: number;
}

interface CreateSessionRequest {
  bots: BotConfig[];
  blinds: BlindsConfig;
}

interface SessionConfigModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: CreateSessionRequest) => void;
}

const DIFFICULTY_OPTIONS: {
  value: BotDifficulty;
  label: string;
  description: string;
  emoji: string;
}[] = [
  { value: 'fish', label: 'Fish', description: '松散被动', emoji: '🐟' },
  { value: 'regular', label: 'Regular', description: 'TAG策略', emoji: '🎯' },
  { value: 'gto', label: 'GTO', description: 'CFR均衡', emoji: '🧠' },
];

const BLINDS_PRESETS = [
  { sb: 1, bb: 2 },
  { sb: 2, bb: 5 },
  { sb: 5, bb: 10 },
  { sb: 10, bb: 20 },
];

const DEFAULT_BOT_NAMES = ['BOT-1', 'BOT-2', 'BOT-3', 'BOT-4', 'BOT-5'];

export const SessionConfigModal: React.FC<SessionConfigModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [botCount, setBotCount] = useState(5);
  const [botDifficulties, setBotDifficulties] = useState<BotDifficulty[]>([
    'fish', 'regular', 'regular', 'gto', 'fish',
  ]);
  const [blindsPresetIndex, setBlindsPresetIndex] = useState(0);
  const [customBlinds, setCustomBlinds] = useState(false);
  const [smallBlind, setSmallBlind] = useState(1);
  const [bigBlind, setBigBlind] = useState(2);

  const effectiveBlinds = useMemo(() => {
    if (customBlinds) return { small_blind: smallBlind, big_blind: bigBlind };
    const preset = BLINDS_PRESETS[blindsPresetIndex];
    return { small_blind: preset.sb, big_blind: preset.bb };
  }, [customBlinds, blindsPresetIndex, smallBlind, bigBlind]);

  const handleBotCountChange = useCallback((count: number) => {
    setBotCount(count);
    setBotDifficulties((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('regular');
      return next.slice(0, count);
    });
  }, []);

  const handleDifficultyChange = useCallback(
    (index: number, difficulty: BotDifficulty) => {
      setBotDifficulties((prev) => {
        const next = [...prev];
        next[index] = difficulty;
        return next;
      });
    },
    [],
  );

  const handleBlindsPreset = useCallback((index: number) => {
    setBlindsPresetIndex(index);
    setCustomBlinds(false);
    setSmallBlind(BLINDS_PRESETS[index].sb);
    setBigBlind(BLINDS_PRESETS[index].bb);
  }, []);

  const isValid = useMemo(() => {
    const { small_blind, big_blind } = effectiveBlinds;
    return (
      botCount >= 1 &&
      botCount <= 5 &&
      small_blind >= 1 &&
      big_blind >= 2 &&
      big_blind > small_blind
    );
  }, [botCount, effectiveBlinds]);

  const handleConfirm = useCallback(() => {
    if (!isValid) return;
    const bots: BotConfig[] = botDifficulties
      .slice(0, botCount)
      .map((difficulty, i) => ({
        name: DEFAULT_BOT_NAMES[i],
        difficulty,
      }));
    onConfirm({ bots, blinds: effectiveBlinds });
  }, [isValid, botCount, botDifficulties, effectiveBlinds, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-config-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div>
            <h2
              id="session-config-title"
              className="text-xl font-bold text-gray-50"
            >
              New Session
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Configure opponents and blinds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* ── Section 1: Bot Count ── */}
          <div>
            <label className="block text-sm font-semibold text-gray-50 mb-3">
              Number of Opponents
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => handleBotCountChange(n)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border transition-all ${
                    botCount === n
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── Section 2: Per-Bot Difficulty ── */}
          <div>
            <label className="block text-sm font-semibold text-gray-50 mb-3">
              Bot Difficulty
            </label>
            <div className="space-y-2">
              {Array.from({ length: botCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
                >
                  <span className="text-sm font-medium text-gray-300 w-14 flex-shrink-0">
                    {DEFAULT_BOT_NAMES[i]}
                  </span>
                  <div className="flex gap-2 flex-1">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleDifficultyChange(i, opt.value)}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                          botDifficulties[i] === opt.value
                            ? opt.value === 'fish'
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                              : opt.value === 'regular'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                        }`}
                      >
                        <span className="mr-1">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Blinds ── */}
          <div>
            <label className="block text-sm font-semibold text-gray-50 mb-3">
              Blinds
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {BLINDS_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleBlindsPreset(index)}
                  className={`py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    !customBlinds && blindsPresetIndex === index
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {preset.sb}/{preset.bb}
                </button>
              ))}
            </div>

            {/* Custom blinds toggle */}
            <button
              onClick={() => setCustomBlinds(!customBlinds)}
              className={`w-full text-xs font-medium py-1.5 rounded transition-colors ${
                customBlinds
                  ? 'text-emerald-400'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              {customBlinds ? '▾ Custom Blinds' : '▸ Custom Blinds'}
            </button>

            {customBlinds && (
              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Small Blind
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-50 placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Big Blind
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={bigBlind}
                    onChange={(e) => setBigBlind(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-50 placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <svg
              className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-gray-400 leading-relaxed">
              6-max No-Limit Hold'em. All players start with 100 BB.
              Positions are assigned automatically each hand.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isValid
                ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionConfigModal;