/**
 * PostflopGuide — renders simplified postflop GTO recommendations
 * based on board texture, hand strength, street, and position.
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { Position } from '../../types/poker';
import type {
  BoardTexture,
  HandStrengthTier,
  PostflopGuide as PostflopGuideType,
  PostflopAction,
} from '../../types/gto';
import { PositionSelector } from './PositionSelector';
import { BoardTextureSelector } from './BoardTextureSelector';
import { HandStrengthSelector } from './HandStrengthSelector';
import { GTODisclaimerBanner } from './GTODisclaimerBanner';

// ─── Action display helpers ─────────────────────────────────────────
const ACTION_DISPLAY: Record<PostflopAction, { label: string; color: string }> = {
  fold: { label: 'Fold', color: 'text-gray-400' },
  check: { label: 'Check', color: 'text-blue-400' },
  call: { label: 'Call', color: 'text-green-400' },
  bet_small: { label: 'Bet Small', color: 'text-yellow-400' },
  bet_medium: { label: 'Bet Medium', color: 'text-orange-400' },
  bet_big: { label: 'Bet Big', color: 'text-red-400' },
  raise: { label: 'Raise', color: 'text-red-400' },
  all_in: { label: 'All-In', color: 'text-red-300' },
};

type PostflopStreet = 'flop' | 'turn' | 'river';

const STREET_OPTIONS: { value: PostflopStreet; label: string }[] = [
  { value: 'flop', label: 'Flop' },
  { value: 'turn', label: 'Turn' },
  { value: 'river', label: 'River' },
];

const IP_OPTIONS = [
  { value: true, label: 'In Position' },
  { value: false, label: 'Out of Position' },
] as const;

interface PostflopGuideProps {
  className?: string;
}

export const PostflopGuide: React.FC<PostflopGuideProps> = ({ className = '' }) => {
  const [guides, setGuides] = useState<PostflopGuideType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [_position, setPosition] = useState<Position>('BTN');
  const [boardTexture, setBoardTexture] = useState<BoardTexture>('high_rainbow_disconnected');
  const [handStrength, setHandStrength] = useState<HandStrengthTier>('medium');
  const [street, setStreet] = useState<PostflopStreet>('flop');
  const [isInPosition, setIsInPosition] = useState(true);

  // Load postflop data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/data/postflop-guides.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { guides: PostflopGuideType[] }) => {
        if (!cancelled) {
          setGuides(data.guides ?? []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load guides');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Find matching guide
  const guide = useMemo(
    () =>
      guides.find(
        (g) =>
          g.boardTexture === boardTexture &&
          g.handStrength === handStrength &&
          g.street === street &&
          g.isInPosition === isInPosition,
      ) ?? null,
    [guides, boardTexture, handStrength, street, isInPosition],
  );

  const rec = guide?.recommendation;
  const primary = rec ? ACTION_DISPLAY[rec.primaryAction] : null;
  const alt = rec?.alternativeAction ? ACTION_DISPLAY[rec.alternativeAction] : null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">Position</p>
          <PositionSelector selected={_position} onChange={setPosition} />
        </div>

        <BoardTextureSelector selected={boardTexture} onChange={setBoardTexture} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">Street</p>
          <div className="flex gap-1.5">
            {STREET_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStreet(s.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  street === s.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">Position Type</p>
          <div className="flex gap-1.5">
            {IP_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setIsInPosition(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isInPosition === opt.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-400">Hand Strength</p>
          <HandStrengthSelector selected={handStrength} onChange={setHandStrength} />
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex h-32 items-center justify-center text-gray-400">
          Loading postflop guides…
        </div>
      )}

      {error && (
        <div className="flex h-32 items-center justify-center text-red-400">
          Error: {error}
        </div>
      )}

      {!loading && !error && !guide && (
        <div className="flex h-32 items-center justify-center text-gray-500">
          No guide available for this combination.
        </div>
      )}

      {rec && primary && (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
          <div className="mb-3 flex items-baseline gap-3">
            <span className={`text-2xl font-bold ${primary.color}`}>{primary.label}</span>
            {rec.sizing && (
              <span className="text-sm text-gray-300">({rec.sizing})</span>
            )}
            {rec.frequency != null && (
              <span className="text-xs text-gray-500">
                {(rec.frequency * 100).toFixed(0)}% of the time
              </span>
            )}
          </div>

          {alt && rec.alternativeAction && (
            <p className="mb-2 text-sm text-gray-400">
              Alternative:{' '}
              <span className={`font-semibold ${alt.color}`}>{alt.label}</span>
              {rec.alternativeFrequency != null && (
                <span className="text-xs text-gray-500">
                  {' '}({(rec.alternativeFrequency * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          )}

          {rec.explanation && (
            <p className="text-sm leading-relaxed text-gray-300">{rec.explanation}</p>
          )}
        </div>
      )}

      <GTODisclaimerBanner message={guide?.disclaimer} />
    </div>
  );
};

export default PostflopGuide;
