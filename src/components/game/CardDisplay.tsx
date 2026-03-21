// ============================================================
// GTO Idiot — Card Display Component
// Renders a single playing card with rank and suit visuals
// ============================================================

import type { Card, Suit } from '../../types';

interface CardDisplayProps {
  card: Card | null;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-100',
  spades: 'text-gray-100',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-11 text-xs',
  md: 'w-11 h-16 text-sm',
  lg: 'w-14 h-20 text-base',
};

export default function CardDisplay({
  card,
  faceDown = false,
  size = 'md',
  className = '',
}: CardDisplayProps) {
  if (faceDown || !card) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-md border border-gray-600 bg-gradient-to-br from-blue-900 to-blue-800 shadow-md ${SIZE_CLASSES[size]} ${className}`}
        aria-label="Face-down card"
      >
        <div className="h-3/4 w-3/4 rounded-sm border border-blue-700 bg-blue-800/50" />
      </div>
    );
  }

  const suitColor = SUIT_COLORS[card.suit];
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-between rounded-md border border-gray-300 bg-white p-0.5 shadow-md ${SIZE_CLASSES[size]} ${className}`}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {/* Top-left rank + suit */}
      <div className={`self-start leading-none ${suitColor}`}>
        <div className="font-bold">{card.rank}</div>
        <div className="-mt-0.5 text-[0.65em]">{suitSymbol}</div>
      </div>

      {/* Center suit symbol */}
      <div className={`absolute inset-0 flex items-center justify-center text-lg ${suitColor}`}>
        {suitSymbol}
      </div>
    </div>
  );
}

/** Renders a row of cards with a small gap */
export function CardRow({
  cards,
  faceDown = false,
  size = 'md',
  className = '',
}: {
  cards: (Card | null)[];
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {cards.map((card, i) => (
        <CardDisplay key={i} card={card} faceDown={faceDown} size={size} />
      ))}
    </div>
  );
}
