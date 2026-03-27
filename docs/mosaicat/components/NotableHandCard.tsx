import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface NotableHand {
  handId: string;
  handNumber: number;
  playerHoleCards: Card[];
  playerChipChange: number;
  worstDeviationSeverity: string;
}

interface NotableHandCardProps {
  hand: NotableHand;
  onClick: (handId: string) => void;
}

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = { s: 'text-gray-50', h: 'text-red-400', d: 'text-sky-400', c: 'text-emerald-400' };

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  blunder: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Blunder' },
  mistake: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Mistake' },
  minor: { bg: 'bg-sky-500/20', text: 'text-sky-400', label: 'Minor' },
  good: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Good' },
};

function MiniCard({ card }: { card: Card }) {
  const suitColor = SUIT_COLORS[card.suit] || 'text-gray-50';
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg w-10 h-14 flex flex-col items-center justify-center">
      <span className={`text-sm font-bold ${suitColor}`}>{card.rank}</span>
      <span className={`text-xs ${suitColor}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

function DeviationBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.minor;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function NotableHandCard({ hand, onClick }: NotableHandCardProps) {
  const chipColor = hand.playerChipChange > 0
    ? 'text-emerald-400'
    : hand.playerChipChange < 0
      ? 'text-red-400'
      : 'text-gray-400';
  const chipPrefix = hand.playerChipChange > 0 ? '+' : '';

  return (
    <button
      type="button"
      onClick={() => onClick(hand.handId)}
      className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-800 hover:border-gray-600 transition-colors text-left cursor-pointer"
    >
      <div className="flex flex-col items-center shrink-0">
        <span className="text-xs text-gray-500 font-medium">Hand</span>
        <span className="text-lg font-bold text-amber-500">#{hand.handNumber}</span>
      </div>

      <div className="flex gap-1.5 shrink-0">
        {hand.playerHoleCards.map((card, i) => (
          <MiniCard key={i} card={card} />
        ))}
      </div>

      <div className="flex-1 min-w-0" />

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-lg font-bold ${chipColor}`}>{chipPrefix}{hand.playerChipChange}</span>
        <DeviationBadge severity={hand.worstDeviationSeverity} />
      </div>
    </button>
  );
}