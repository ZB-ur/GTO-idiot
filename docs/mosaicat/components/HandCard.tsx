import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface HandSummary {
  id: string;
  sessionId: string;
  handNumber: number;
  timestamp: string;
  playerHoleCards: Card[];
  communityCards: Card[];
  playerChipChange: number;
  wentToShowdown: boolean;
  actionSummary?: string;
}

interface HandCardProps {
  hand: HandSummary;
  onClick: (handId: string) => void;
}

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = { s: 'text-gray-50', h: 'text-red-400', d: 'text-sky-400', c: 'text-emerald-400' };

function MiniCard({ card }: { card: Card }) {
  const suitColor = SUIT_COLORS[card.suit] || 'text-gray-50';
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg w-9 h-12 flex flex-col items-center justify-center">
      <span className={`text-xs font-bold ${suitColor}`}>{card.rank}</span>
      <span className={`text-[10px] ${suitColor}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

export function HandCard({ hand, onClick }: HandCardProps) {
  const chipColor = hand.playerChipChange > 0
    ? 'text-emerald-400'
    : hand.playerChipChange < 0
      ? 'text-red-400'
      : 'text-gray-400';
  const chipPrefix = hand.playerChipChange > 0 ? '+' : '';

  return (
    <button
      type="button"
      onClick={() => onClick(hand.id)}
      className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition-colors text-left cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Hand number */}
        <div className="flex flex-col items-center shrink-0 w-12">
          <span class="text-xs text-gray-500 font-medium">Hand</span>
          <span className="text-lg font-bold text-amber-500">#{hand.handNumber}</span>
        </div>

        {/* Hole cards */}
        <div className="flex gap-1 shrink-0">
          {hand.playerHoleCards.map((card, i) => (
            <MiniCard key={i} card={card} />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-700 shrink-0" />

        {/* Community cards */}
        <div className="flex gap-1 flex-wrap min-w-0">
          {hand.communityCards.length > 0 ? (
            hand.communityCards.map((card, i) => (
              <MiniCard key={i} card={card} />
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No board</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Result */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-lg font-bold ${chipColor}`}>{chipPrefix}{hand.playerChipChange}</span>
          <div className="flex items-center gap-1.5">
            {hand.wentToShowdown && (
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold bg-gray-800 px-1.5 py-0.5 rounded">SD</span>
            )}
          </div>
        </div>
      </div>

      {/* Action summary */}
      {hand.actionSummary && (
        <p className="mt-2 text-sm text-gray-400 truncate pl-16">{hand.actionSummary}</p>
      )}
    </button>
  );
}