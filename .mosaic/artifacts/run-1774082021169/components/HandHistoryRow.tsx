'use client';

import type { Card, Position } from '@/engine/types';

interface HandHistorySummary {
  id: string;
  date: string;
  position: Position;
  holeCards: { card1: Card; card2: Card };
  result: number;
  keyAction?: string;
}

interface HandHistoryRowProps {
  hand: HandHistorySummary;
  onClick: (handId: string) => void;
}

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = { s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900' };

function MiniCard({ card }: { card: Card }) {
  return (
    <span className={`inline-flex items-center gap-0 font-bold text-xs ${SUIT_COLORS[card.suit]}`}>
      {card.rank}{SUIT_SYMBOLS[card.suit]}
    </span>
  );
}

export default function HandHistoryRow({ hand, onClick }: HandHistoryRowProps) {
  const isWin = hand.result > 0;
  const isLoss = hand.result < 0;

  return (
    <button
      type="button"
      onClick={() => onClick(hand.id)}
      className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all text-left"
    >
      {/* Date */}
      <div className="text-gray-500 text-xs font-mono w-16 flex-shrink-0">
        {hand.date}
      </div>

      {/* Position */}
      <span className="bg-gray-700 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
        {hand.position}
      </span>

      {/* Hole cards */}
      <div className="flex gap-1 bg-white rounded px-1.5 py-0.5">
        <MiniCard card={hand.holeCards.card1} />
        <MiniCard card={hand.holeCards.card2} />
      </div>

      {/* Key action tag */}
      {hand.keyAction && (
        <span className="bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">
          {hand.keyAction}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Result */}
      <span
        className={`font-mono font-bold text-sm ${
          isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'
        }`}
      >
        {isWin ? '+' : ''}{hand.result.toFixed(1)} BB
      </span>

      {/* Arrow */}
      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
}