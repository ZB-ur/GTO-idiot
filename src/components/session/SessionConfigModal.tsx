// ============================================================
// GTO Idiot — Session Configuration Modal
// Configure bots, blinds, and starting stack before play
// ============================================================

import { useState } from 'react';
import Modal from '../common/Modal';
import { useSessionStore, selectDefaultSessionConfig } from '../../stores/session-store';
import { useUIStore } from '../../stores/ui-store';
import type { BotConfig, BotDifficulty, CreateSessionRequest } from '../../types';
import { useNavigate } from 'react-router-dom';

export const SESSION_CONFIG_MODAL_ID = 'session-config';

const DIFFICULTY_OPTIONS: { value: BotDifficulty; label: string; desc: string }[] = [
  { value: 'fish', label: 'Fish', desc: 'Loose passive play' },
  { value: 'regular', label: 'Regular', desc: 'TAG strategy' },
  { value: 'gto', label: 'GTO', desc: 'Balanced GTO play' },
];

export default function SessionConfigModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const addToast = useUIStore((s) => s.addToast);
  const createNewSession = useSessionStore((s) => s.createNewSession);
  const creatingSession = useSessionStore((s) => s.creatingSession);
  const navigate = useNavigate();

  const defaults = selectDefaultSessionConfig();
  const [bots, setBots] = useState<BotConfig[]>(defaults.bots);
  const [smallBlind, setSmallBlind] = useState(defaults.blinds.small_blind);
  const [bigBlind, setBigBlind] = useState(defaults.blinds.big_blind);

  const isOpen = activeModal === SESSION_CONFIG_MODAL_ID;

  const updateBot = (index: number, field: keyof BotConfig, value: string) => {
    setBots((prev) =>
      prev.map((bot, i) =>
        i === index ? { ...bot, [field]: value } : bot,
      ),
    );
  };

  const addBot = () => {
    if (bots.length >= 5) return;
    setBots((prev) => [
      ...prev,
      { name: `BOT-${prev.length + 1}`, difficulty: 'regular' },
    ]);
  };

  const removeBot = (index: number) => {
    if (bots.length <= 1) return;
    setBots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStart = async () => {
    const request: CreateSessionRequest = {
      bots,
      blinds: { small_blind: smallBlind, big_blind: bigBlind },
    };

    try {
      await createNewSession(request);
      closeModal();
      addToast({ type: 'success', message: 'Session started!' });
      navigate('/play');
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create session',
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title="New Session"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Blinds */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Blinds
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">SB</label>
              <input
                type="number"
                min={1}
                value={smallBlind}
                onChange={(e) => setSmallBlind(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <span className="mt-5 text-gray-500">/</span>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">BB</label>
              <input
                type="number"
                min={2}
                value={bigBlind}
                onChange={(e) => setBigBlind(Math.max(2, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bots */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Opponents ({bots.length}/5)
            </label>
            {bots.length < 5 && (
              <button
                onClick={addBot}
                className="text-xs text-green-400 transition hover:text-green-300"
              >
                + Add Bot
              </button>
            )}
          </div>

          <div className="space-y-2">
            {bots.map((bot, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-900 p-2">
                <input
                  type="text"
                  value={bot.name}
                  onChange={(e) => updateBot(i, 'name', e.target.value)}
                  className="w-24 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white focus:border-green-500 focus:outline-none"
                  placeholder="Name"
                />
                <select
                  value={bot.difficulty}
                  onChange={(e) => updateBot(i, 'difficulty', e.target.value)}
                  className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-white focus:border-green-500 focus:outline-none"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
                {bots.length > 1 && (
                  <button
                    onClick={() => removeBot(i)}
                    className="text-gray-500 transition hover:text-red-400"
                    aria-label="Remove bot"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={closeModal}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={creatingSession || bots.length === 0}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {creatingSession ? 'Starting...' : 'Start Session'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
