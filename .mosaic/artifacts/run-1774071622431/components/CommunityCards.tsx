import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface CommunityCardsProps {
  cards: Card[];
}

const suitSymbols: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<string, string> = { s: 'text-gray-900', h: 'text-red-500', d: 'text-blue-500', c: 'text-green-600' };

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  const placeholders = 5 - cards.length;

  return (
    <div className="flex items-center justify-center gap-2">
      {cards.map((card, i) => (
        <div
          key={i}
          className="w-14 h-20 bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-gray-200 transition-all duration-300"
        >
          <span className={`text-lg font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
          <span className={`text-xl ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
        </div>
      ))}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-14 h-20 rounded-lg border-2 border-dashed border-emerald-600/40 flex items-center justify-center"
        >
          <span className="text-emerald-600/30 text-2xl">?</span>
        </div>
      ))}
    </div>
  );
};

export default CommunityCards;