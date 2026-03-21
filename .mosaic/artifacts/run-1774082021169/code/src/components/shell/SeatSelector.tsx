import { useState } from 'react';
import type { Position } from '../../types/game';
import { POSITIONS } from '../../types/game';

interface SeatSelectorProps {
  readonly onSelect: (position: Position, stack: number) => void;
  readonly isLoading?: boolean;
}

const POSITION_DESCRIPTIONS: Record<Position, string> = {
  UTG: 'Under the Gun — First to act preflop',
  MP: 'Middle Position — Moderate positional advantage',
  CO: 'Cutoff — Strong late position',
  BTN: 'Button — Best position, acts last postflop',
  SB: 'Small Blind — Posts half blind, acts first postflop',
  BB: 'Big Blind — Posts full blind, last preflop',
};

export function SeatSelector({ onSelect, isLoading = false }: SeatSelectorProps) {
  const [selected, setSelected] = useState<Position>('BTN');
  const [stack, setStack] = useState(100);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-xl font-bold text-white">Choose Your Seat</h2>

      {/* Seat grid */}
      <div className="grid grid-cols-3 gap-3">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => setSelected(pos)}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all ${
              selected === pos
                ? 'border-felt-500 bg-felt-900/60 text-white shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
          >
            <span className="text-lg font-bold">{pos}</span>
            <span className="text-[10px] leading-tight">{POSITION_DESCRIPTIONS[pos].split('—')[0]}</span>
          </button>
        ))}
      </div>

      {/* Position description */}
      <p className="text-center text-xs text-gray-400">{POSITION_DESCRIPTIONS[selected]}</p>

      {/* Stack size */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">Starting Stack (BB)</label>
        <div className="flex items-center gap-3">
          {[50, 100, 200].map((s) => (
            <button
              key={s}
              onClick={() => setStack(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                stack === s
                  ? 'bg-felt-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {s} BB
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => onSelect(selected, stack)}
        disabled={isLoading}
        className="btn-primary w-full py-3 text-base font-bold disabled:opacity-50"
      >
        {isLoading ? 'Starting...' : 'Start Game'}
      </button>
    </div>
  );
}
