import React, { useEffect, useState } from 'react';

export interface Card {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface CommunityCardsProps {
  cards: Card[];
  animate?: boolean;
}

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<Card['suit'], string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

function CardDisplay({ card, index, animate }: { card: Card; index: number; animate: boolean }) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [animate, index, card.rank, card.suit]);

  return (
    <div
      className={`
        relative w-16 h-22 sm:w-20 sm:h-28 rounded-lg bg-white shadow-md
        border border-gray-200 flex flex-col items-center justify-center
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 -translate-y-4'}
      `}
      style={{ minWidth: '4rem', minHeight: '5.5rem' }}
    >
      <span className={`text-lg sm:text-xl font-bold ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-xl sm:text-2xl leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

function EmptySlot() {
  return (
    <div
      className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-emerald-700/40
        bg-emerald-900/30 flex items-center justify-center"
      style={{ minWidth: '4rem', minHeight: '5.5rem' }}
    >
      <span className="text-emerald-700/50 text-2xl">?</span>
    </div>
  );
}

export default function CommunityCards({ cards, animate = true }: CommunityCardsProps) {
  const totalSlots = 5;
  const streetLabel = cards.length === 0
    ? 'Preflop'
    : cards.length <= 3
      ? 'Flop'
      : cards.length === 4
        ? 'Turn'
        : 'River';

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {streetLabel}
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Flop group (indices 0-2) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[0, 1, 2].map((i) =>
            cards[i] ? (
              <CardDisplay key={`${cards[i].rank}${cards[i].suit}`} card={cards[i]} index={i} animate={animate} />
            ) : (
              <EmptySlot key={`empty-${i}`} />
            )
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-16 sm:h-20 bg-emerald-700/30" />

        {/* Turn (index 3) */}
        {cards[3] ? (
          <CardDisplay card={cards[3]} index={3} animate={animate} />
        ) : (
          <EmptySlot />
        )}

        {/* Divider */}
        <div className="w-px h-16 sm:h-20 bg-emerald-700/30" />

        {/* River (index 4) */}
        {cards[4] ? (
          <CardDisplay card={cards[4]} index={4} animate={animate} />
        ) : (
          <EmptySlot />
        )}
      </div>
    </div>
  );
}