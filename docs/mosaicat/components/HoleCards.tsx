import React from 'react';

export interface Card {
  rank: string;
  suit: 'h' | 'd' | 'c' | 's';
}

export interface HoleCardsProps {
  cards: [Card, Card];
  faceUp?: boolean;
  greyed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<string, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

const suitColors: Record<string, string> = {
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
  s: 'text-gray-900',
};

const sizeMap = {
  sm: { card: 'w-10 h-14', rank: 'text-sm', suit: 'text-xs', gap: 'gap-1' },
  md: { card: 'w-14 h-20', rank: 'text-lg', suit: 'text-sm', gap: 'gap-1.5' },
  lg: { card: 'w-20 h-28', rank: 'text-2xl', suit: 'text-lg', gap: 'gap-2' },
};

export const HoleCards: React.FC<HoleCardsProps> = ({
  cards,
  faceUp = true,
  greyed = false,
  size = 'md',
}) => {
  const s = sizeMap[size];

  if (!faceUp) {
    return (
      <div className={`flex ${s.gap}`}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`${s.card} rounded-lg bg-blue-800 border border-blue-900 shadow-sm flex items-center justify-center`}
          >
            <div className="w-3/4 h-3/4 rounded border border-blue-600 bg-blue-700 opacity-80" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex ${s.gap} ${greyed ? 'opacity-40' : ''}`}>
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${s.card} rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center select-none`}
        >
          <span className={`${s.rank} font-bold leading-none ${suitColors[card.suit]}`}>
            {card.rank}
          </span>
          <span className={`${s.suit} leading-none ${suitColors[card.suit]}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HoleCards;