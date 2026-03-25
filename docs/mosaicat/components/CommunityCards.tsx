import React from 'react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

interface CardData {
  rank: Rank;
  suit: Suit;
}

interface CommunityCardsProps {
  cards: CardData[];
  animateNew?: boolean;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const isRedSuit = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  animateNew = false,
}) => {
  const totalSlots = 5;
  const emptySlots = totalSlots - cards.length;

  return (
    <div className="flex items-center justify-center gap-2">
      {cards.map((card, i) => {
        const isNew = animateNew && i >= cards.length - (cards.length === 3 ? 3 : 1);
        return (
          <div
            key={i}
            className={`
              relative w-16 h-22 rounded-lg border-2 border-gray-300 shadow-md bg-white select-none
              ${isNew ? 'animate-[fadeIn_0.4s_ease-out]' : ''}
            `}
            style={{ minHeight: '88px' }}
            role="img"
            aria-label={`${card.rank} of ${card.suit}`}
          >
            <div
              className={`absolute top-1 left-1.5 font-bold text-sm leading-none ${
                isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'
              }`}
            >
              <div>{card.rank}</div>
              <div className="text-xs">{suitSymbols[card.suit]}</div>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center text-2xl ${
                isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'
              }`}
            >
              {suitSymbols[card.suit]}
            </div>
          </div>
        );
      })}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-16 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/30 select-none"
          style={{ minHeight: '88px' }}
          role="img"
          aria-label="Empty card slot"
        />
      ))}
    </div>
  );
};

export default CommunityCards;