// ============================================================
// HandHistoryItem — Single row in the hand history list
// ============================================================

import React from 'react';
import type { HandHistorySummary } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types';

interface HandHistoryItemProps {
  hand: HandHistorySummary;
  onSelect: (handId: string) => void;
}

function formatCardShort(card: { rank: string; suit: 's' | 'h' | 'd' | 'c' }): {
  text: string;
  color: string;
} {
  const symbol = SUIT_SYMBOLS[card.suit];
  const color = SUIT_COLORS[card.suit] === 'red' ? 'text-red-400' : 'text-gray-200';
  return { text: `${card.rank}${symbol}`, color };
}

function resultBadge(result: 'won' | 'lost' | 'folded'): { label: string; cls: string } {
  switch (result) {
    case 'won':
      return { label: 'Won', cls: 'bg-green-900/50 text-green-400 border-green-700' };
    case 'lost':
      return { label: 'Lost', cls: 'bg-red-900/50 text-red-400 border-red-700' };
    case 'folded':
      return { label: 'Folded', cls: 'bg-gray-800/50 text-gray-400 border-gray-600' };
  }
}

function formatPL(bb: number): { text: string; cls: string } {
  if (bb > 0) return { text: `+${bb.toFixed(1)} BB`, cls: 'text-green-400' };
  if (bb < 0) return { text: `${bb.toFixed(1)} BB`, cls: 'text-red-400' };
  return { text: '0 BB', cls: 'text-gray-400' };
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const HandHistoryItem: React.FC<HandHistoryItemProps> = ({ hand, onSelect }) => {
  const badge = resultBadge(hand.result);
  const pl = formatPL(hand.profitLossBB);

  return (
    <button
      onClick={() => onSelect(hand.id)}
      className="w-full text-left px-4 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg
                 border border-gray-700/50 hover:border-gray-600/50 transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: hand info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hand number */}
          <span className="text-xs text-gray-500 font-mono w-8 shrink-0">
            #{hand.handNumber}
          </span>

          {/* Hole cards */}
          <div className="flex gap-0.5 shrink-0">
            {hand.userHoleCards.map((card, i) => {
              const c = formatCardShort(card);
              return (
                <span key={i} className={`font-mono text-sm font-semibold ${c.color}`}>
                  {c.text}
                </span>
              );
            })}
          </div>

          {/* Position badge */}
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 shrink-0">
            {hand.userPosition}
          </span>

          {/* Result badge */}
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${badge.cls} shrink-0`}>
            {badge.label}
          </span>

          {/* Reached street */}
          <span className="text-xs text-gray-500 capitalize hidden sm:inline">
            {hand.reachedStreet}
          </span>
        </div>

        {/* Right: P/L + timestamp */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-mono font-semibold ${pl.cls}`}>
            {pl.text}
          </span>
          <span className="text-xs text-gray-500 hidden md:inline w-28 text-right">
            {formatTime(hand.timestamp)}
          </span>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default React.memo(HandHistoryItem);
