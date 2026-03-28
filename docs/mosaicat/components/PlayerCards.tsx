import React from 'react';

// Types from API spec
type Suit = 's' | 'h' | 'd' | 'c';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  rank: Rank;
  suit: Suit;
}

interface PlayerCardsProps {
  /** Two hole cards, or null if no cards dealt yet */
  cards?: [Card, Card] | null;
  /** Whether to show card backs (true for opponents, false for user / showdown) */
  faceDown?: boolean;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

function PlayingCard({ card, faceDown }: { card: Card; faceDown: boolean }) {
  if (faceDown) {
    return (
      <div
        className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-900 shadow-sm flex items-center justify-center select-none"
        aria-label="Face-down card"
      >
        {/* Card back pattern */}
        <div className="w-7 h-10 rounded border border-blue-400/30 bg-blue-700/50 flex items-center justify-center">
          <div className="w-5 h-8 rounded border border-blue-400/20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
        </div>
      </div>
    );
  }

  const symbol = SUIT_SYMBOLS[card.suit];
  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div
      className="w-10 h-14 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-between py-1 px-0.5 select-none"
      aria-label={`${card.rank}${symbol}`}
    >
      <span className={`text-xs font-bold leading-none ${colorClass}`}>
        {card.rank}
      </span>
      <span className={`text-sm leading-none ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
}

/**
 * PlayerCards — renders two hole cards side by side.
 *
 * - User's cards: face-up during play.
 * - Opponent cards: face-down during play, face-up at showdown.
 * - If `cards` is null/undefined, renders empty placeholder.
 */
export const PlayerCards: React.FC<PlayerCardsProps> = ({
  cards = null,
  faceDown = false,
}) => {
  if (!cards) {
    return (
      <div className="flex gap-1" aria-label="No cards">
        {/* Empty card placeholders */}
        <div className="w-10 h-14 rounded-lg border border-dashed border-gray-300/50 bg-gray-100/30" />
        <div className="w-10 h-14 rounded-lg border border-dashed border-gray-300/50 bg-gray-100/30" />
      </div>
    );
  }

  return (
    <div
      className="flex gap-1"
      style={{ transform: 'perspective(200px)' }}
      aria-label={faceDown ? 'Hidden cards' : `${cards[0].rank}${SUIT_SYMBOLS[cards[0].suit]} ${cards[1].rank}${SUIT_SYMBOLS[cards[1].suit]}`}
    >
      <div className="-rotate-3">
        <PlayingCard card={cards[0]} faceDown={faceDown} />
      </div>
      <div className="rotate-3">
        <PlayingCard card={cards[1]} faceDown={faceDown} />
      </div>
    </div>
  );
};

export default PlayerCards;