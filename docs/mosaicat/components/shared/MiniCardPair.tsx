import React from 'react';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  rank: Rank;
  suit: Suit;
}

interface MiniCardPairProps {
  cards: [Card, Card];
}

const suitSymbol: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const isRed = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

export const MiniCardPair: React.FC<MiniCardPairProps> = ({ cards }) => {
  return (
    <div className="inline-flex -space-x-2">
      {cards.map((card, i) => (
        <div
          key={i}
          className="w-8 h-11 bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center text-[10px] font-bold leading-none shadow-sm"
          style={{ zIndex: i }}
        >
          <span className={isRed(card.suit) ? 'text-red-500' : 'text-gray-900'}>
            {card.rank}
          </span>
          <span className={isRed(card.suit) ? 'text-red-500' : 'text-gray-900'}>
            {suitSymbol[card.suit]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MiniCardPair;