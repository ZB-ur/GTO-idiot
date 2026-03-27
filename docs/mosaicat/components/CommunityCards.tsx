import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface CommunityCardsProps {
  cards: Card[];
  animated?: boolean;
}

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

function CardFace({ card, index, animated }: { card: Card; index: number; animated?: boolean }) {
  const color = suitColors[card.suit];
  const animationDelay = animated ? `${index * 150}ms` : '0ms';

  return (
    <div
      className={`w-16 h-22 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center border border-gray-200 select-none transition-all duration-300 ${
        animated ? 'animate-fade-in' : ''
      }`}
      style={{
        animationDelay,
        minWidth: '4rem',
        height: '5.5rem',
      }}
    >
      <span className={`text-xl font-bold ${color} leading-none`}>
        {card.rank}
      </span>
      <span className={`text-xl ${color} leading-none mt-0.5`}>
        {suitSymbols[card.suit]}
      </span>
    </div>
  );
}

function EmptySlot() {
  return (
    <div
      className="w-16 rounded-lg border border-dashed border-gray-600/40 bg-gray-800/30 select-none"
      style={{ minWidth: '4rem', height: '5.5rem' }}
    />
  );
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  animated = false,
}) => {
  const totalSlots = 5;
  const emptySlots = totalSlots - cards.length;

  return (
    <div className="flex items-center justify-center gap-2">
      {cards.map((card, i) => (
        <CardFace key={`${card.rank}-${card.suit}-${i}`} card={card} index={i} animated={animated} />
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptySlot key={`empty-${i}`} />
      ))}
    </div>
  );
};

export default CommunityCards;