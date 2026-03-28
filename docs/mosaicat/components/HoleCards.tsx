import React from 'react';

interface CardData {
  rank: string;
  suit: string;
}

interface HoleCardsProps {
  cards?: CardData[];
  faceDown?: boolean;
  className?: string;
}

const suitSymbol: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
  h: '♥', d: '♦', c: '♣', s: '♠',
};

const suitColor: Record<string, string> = {
  hearts: 'text-red-500', diamonds: 'text-red-500',
  clubs: 'text-gray-50', spades: 'text-gray-50',
  h: 'text-red-500', d: 'text-red-500',
  c: 'text-gray-50', s: 'text-gray-50',
};

export function HoleCards({ cards, faceDown = false, className = '' }: HoleCardsProps) {
  const renderFaceDown = () => (
    <div className="w-12 h-[68px] rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/50 shadow-lg flex items-center justify-center">
      <div className="w-8 h-12 rounded border border-amber-300/30 bg-amber-600/50" />
    </div>
  );

  const renderCard = (card: CardData, index: number) => {
    const symbol = suitSymbol[card.suit] ?? card.suit;
    const color = suitColor[card.suit] ?? 'text-gray-50';
    return (
      <div
        key={index}
        className="w-12 h-[68px] rounded-lg bg-gray-50 border border-gray-200 shadow-lg flex flex-col items-center justify-center gap-0.5"
      >
        <span className={`text-sm font-bold leading-none ${color}`}>{card.rank}</span>
        <span className={`text-lg leading-none ${color}`}>{symbol}</span>
      </div>
    );
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {faceDown || !cards
        ? [0, 1].map((i) => <React.Fragment key={i}>{renderFaceDown()}</React.Fragment>)
        : cards.slice(0, 2).map((c, i) => renderCard(c, i))}
    </div>
  );
}