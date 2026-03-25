import React from 'react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

interface CardData {
  rank: Rank;
  suit: Suit;
}

interface HoleCardsProps {
  cards: CardData[];
  faceUp?: boolean;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const isRedSuit = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

export const HoleCards: React.FC<HoleCardsProps> = ({ cards, faceUp = true }) => {
  return (
    <div className="flex items-center gap-2">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`
            relative w-20 h-28 rounded-lg border-2 shadow-lg select-none
            transition-transform duration-300 ease-out
            ${faceUp
              ? 'bg-white border-gray-300'
              : 'bg-gradient-to-br from-emerald-700 to-emerald-900 border-emerald-600'
            }
            ${i === 0 ? '-rotate-3' : 'rotate-3'}
            hover:scale-105
          `}
          role="img"
          aria-label={faceUp ? `${card.rank} of ${card.suit}` : 'Card face down'}
        >
          {faceUp ? (
            <>
              <div
                className={`absolute top-1.5 left-2 font-bold text-lg leading-none ${
                  isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'
                }`}
              >
                <div>{card.rank}</div>
                <div className="text-sm">{suitSymbols[card.suit]}</div>
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-center text-4xl ${
                  isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'
                }`}
              >
                {suitSymbols[card.suit]}
              </div>
              <div
                className={`absolute bottom-1.5 right-2 font-bold text-lg leading-none rotate-180 ${
                  isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'
                }`}
              >
                <div>{card.rank}</div>
                <div className="text-sm">{suitSymbols[card.suit]}</div>
              </div>
            </>
          ) : (
            <div className="absolute inset-1 rounded-md bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.08)_4px,rgba(255,255,255,0.08)_8px)]" />
          )}
        </div>
      ))}
    </div>
  );
};

export default HoleCards;