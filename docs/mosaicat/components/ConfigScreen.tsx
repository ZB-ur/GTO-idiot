import React, { useState, useCallback } from 'react';
import { SeatSelector } from './SeatSelector';
import { BotStyleDropdown } from './BotStyleDropdown';
import { Spinner } from './Spinner';

type BotStyle = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'CallingStation';
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type SeatType = 'empty' | 'player' | 'bot';

interface SeatConfig {
  position: Position;
  type: SeatType;
  botStyle: BotStyle;
}

interface CreateSessionRequest {
  seats: Array<{
    position: Position;
    type: SeatType;
    botStyle?: BotStyle;
  }>;
}

interface ConfigScreenProps {
  onStartSession: (config: CreateSessionRequest) => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const DEFAULT_BOT_STYLES: BotStyle[] = ['TAG', 'LAG', 'Fish', 'Nit', 'CallingStation'];

const INITIAL_SEATS: SeatConfig[] = [
  { position: 'UTG', type: 'bot', botStyle: 'TAG' },
  { position: 'MP', type: 'bot', botStyle: 'LAG' },
  { position: 'CO', type: 'player', botStyle: 'TAG' },
  { position: 'BTN', type: 'bot', botStyle: 'Fish' },
  { position: 'SB', type: 'bot', botStyle: 'Nit' },
  { position: 'BB', type: 'bot', botStyle: 'CallingStation' },
];

/**
 * Seat positions around an oval table (6-max).
 * Ordered: UTG (top-left), MP (top-right), CO (right),
 * BTN (bottom-right), SB (bottom-left), BB (left)
 */
const SEAT_LAYOUT: Record<Position, string> = {
  UTG: 'top-0 left-[12%]',
  MP: 'top-0 right-[12%]',
  CO: 'top-1/2 -translate-y-1/2 right-0',
  BTN: 'bottom-0 right-[12%]',
  SB: 'bottom-0 left-[12%]',
  BB: 'top-1/2 -translate-y-1/2 left-0',
};

const ConfigScreen: React.FC<ConfigScreenProps> = ({ onStartSession }) => {
  const [seats, setSeats] = useState<SeatConfig[]>(INITIAL_SEATS);
  const [isStarting, setIsStarting] = useState(false);

  const playerSeatIndex = seats.findIndex((s) => s.type === 'player');
  const filledSeats = seats.filter((s) => s.type !== 'empty').length;
  const canStart = playerSeatIndex !== -1 && filledSeats >= 2;

  const cycleSeatType = useCallback((index: number) => {
    setSeats((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const hasPlayer = prev.some((s, i) => i !== index && s.type === 'player');

      let nextType: SeatType;
      if (current.type === 'empty') {
        nextType = hasPlayer ? 'bot' : 'player';
      } else if (current.type === 'player') {
        nextType = 'bot';
      } else {
        nextType = 'empty';
      }

      updated[index] = {
        ...current,
        type: nextType,
        botStyle: nextType === 'bot' ? (current.botStyle ?? 'TAG') : current.botStyle,
      };
      return updated;
    });
  }, []);

  const updateBotStyle = useCallback((index: number, style: string) => {
    setSeats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], botStyle: style as BotStyle };
      return updated;
    });
  }, []);

  const handleStart = () => {
    if (!canStart) return;
    setIsStarting(true);
    onStartSession({
      seats: seats.map((s) => ({
        position: s.position,
        type: s.type,
        ...(s.type === 'bot' ? { botStyle: s.botStyle } : {}),
      })),
    });
  };

  const selectedSeat = seats.find(
    (_, i) => false, // no individual selection state needed; each seat is self-contained
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-50 tracking-tight mb-1">
          Table Setup
        </h1>
        <p className="text-base text-gray-400">
          Tap seats to configure · Pick your position and BOT opponents
        </p>
      </div>

      {/* Visual table */}
      <div className="relative w-[420px] h-[280px] mb-8">
        {/* Oval felt */}
        <div className="absolute inset-10 rounded-full bg-emerald-900/40 border-2 border-emerald-700/30 shadow-lg shadow-black/40" />
        <div className="absolute inset-14 rounded-full bg-emerald-900/20 border border-emerald-700/15" />

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-semibold text-emerald-700/60 uppercase tracking-widest">
            6-Max
          </span>
        </div>

        {/* Seats */}
        {seats.map((seat, index) => (
          <div
            key={seat.position}
            className={`absolute ${SEAT_LAYOUT[seat.position]}`}
          >
            <SeatSelector
              position={seat.position}
              isSelected={seat.type !== 'empty'}
              isPlayer={seat.type === 'player'}
              botStyle={seat.type === 'bot' ? seat.botStyle : undefined}
              onClick={() => cycleSeatType(index)}
            />
          </div>
        ))}
      </div>

      {/* Bot Style Configuration Panel */}
      <div className="w-full max-w-lg mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
          Bot Styles
        </h2>
        <div className="space-y-3">
          {seats
            .map((seat, index) => ({ seat, index }))
            .filter(({ seat }) => seat.type === 'bot')
            .map(({ seat, index }) => (
              <div
                key={seat.position}
                className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-900 rounded-xl border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 text-center text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-600/20 py-1 rounded-lg">
                    {seat.position}
                  </span>
                  <span className="text-sm text-gray-400">Bot</span>
                </div>
                <BotStyleDropdown
                  value={seat.botStyle}
                  onChange={(style) => updateBotStyle(index, style)}
                />
              </div>
            ))}
          {seats.filter((s) => s.type === 'bot').length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">
              No bots configured — tap seats on the table to add opponents
            </p>
          )}
        </div>
      </div>

      {/* Validation hint */}
      {!canStart && (
        <p className="text-sm text-amber-400/80 mb-4 text-center">
          {playerSeatIndex === -1
            ? 'Tap a seat to assign yourself a position'
            : 'You need at least one opponent to start'}
        </p>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart || isStarting}
        className={`
          w-full max-w-sm flex items-center justify-center gap-3
          px-6 py-4 font-semibold text-lg rounded-xl
          shadow-lg shadow-black/40 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-950
          ${canStart && !isStarting
            ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 cursor-pointer'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
          }
        `}
      >
        {isStarting ? (
          <>
            <Spinner size="sm" />
            <span>Starting…</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Start Session
          </>
        )}
      </button>

      {/* Seat count summary */}
      <p className="mt-4 text-xs text-gray-500">
        {filledSeats} / 6 seats filled · {seats.filter((s) => s.type === 'bot').length} bots
      </p>
    </div>
  );
};

export default ConfigScreen;