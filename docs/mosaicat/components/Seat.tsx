import React from 'react';
import type { Player } from '../types';

interface LastAction {
  action: string;
  amount?: number;
}

interface SeatProps {
  player: Player;
  isDealer: boolean;
  isActive: boolean;
  showThinking: boolean;
  lastAction?: LastAction;
  className?: string;
}

const STYLE_COLORS: Record<string, string> = {
  TAG: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LAG: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  FISH: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  NIT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  MANIAC: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ACTION_COLORS: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-gray-400',
  call: 'text-emerald-400',
  bet: 'text-amber-400',
  raise: 'text-amber-400',
  all_in: 'text-red-400',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

const SUIT_SYMBOLS: Record<string, { char: string; color: string }> = {
  s: { char: '♠', color: 'text-gray-300' },
  h: { char: '♥', color: 'text-red-400' },
  d: { char: '♦', color: 'text-blue-400' },
  c: { char: '♣', color: 'text-emerald-400' },
};

export const Seat: React.FC<SeatProps> = ({
  player,
  isDealer,
  isActive,
  showThinking,
  lastAction,
  className = '',
}) => {
  const isFolded = !player.isActive;

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${className} ${
        isFolded ? 'opacity-50' : ''
      }`}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-gray-950 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
          D
        </div>
      )}

      {/* Main Seat Card */}
      <div
        className={`relative w-28 rounded-xl border p-3 transition-all ${
          isActive
            ? 'bg-gray-800 border-amber-500 shadow-lg shadow-amber-500/20'
            : 'bg-gray-800 border-gray-700'
        }`}
      >
        {/* Thinking Indicator */}
        {showThinking && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Nickname + Position */}
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold truncate ${player.isUser ? 'text-amber-400' : 'text-gray-50'}`}>
            {player.nickname}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">{player.position}</span>
        </div>

        {/* Chip Count */}
        <div className="text-sm font-bold text-gray-50 mb-2">
          {player.chipCount} <span className="text-[10px] text-gray-500 font-normal">BB</span>
        </div>

        {/* Hole Cards */}
        {player.holeCards ? (
          <div className="flex gap-1 justify-center">
            {player.holeCards.map((card, i) => (
              <div
                key={i}
                className="w-8 h-11 bg-gray-900 border border-gray-600 rounded-md flex flex-col items-center justify-center"
              >
                <span className="text-xs font-bold text-gray-50 leading-none">{card.rank}</span>
                <span className={`text-xs leading-none ${SUIT_SYMBOLS[card.suit].color}`}>
                  {SUIT_SYMBOLS[card.suit].char}
                </span>
              </div>
            ))}
          </div>
        ) : (
          !isFolded && (
            <div className="flex gap-1 justify-center">
              <div className="w-8 h-11 bg-emerald-900 border border-emerald-700 rounded-md" />
              <div className="w-8 h-11 bg-emerald-900 border border-emerald-700 rounded-md" />
            </div>
          )
        )}

        {/* Bot Style Tag */}
        {player.botStyle && (
          <div className={`mt-2 text-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${STYLE_COLORS[player.botStyle]}`}>
            {player.botStyle}
          </div>
        )}
      </div>

      {/* Action Label */}
      {lastAction && (
        <div className={`text-xs font-semibold ${ACTION_COLORS[lastAction.action] || 'text-gray-400'}`}>
          {ACTION_LABELS[lastAction.action] || lastAction.action}
          {lastAction.amount !== undefined && ` ${lastAction.amount}`}
        </div>
      )}
    </div>
  );
};