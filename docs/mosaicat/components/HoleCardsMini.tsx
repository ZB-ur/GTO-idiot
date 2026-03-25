import React from 'react';

export interface Card {
  rank: string;
  suit: 'h' | 'd' | 'c' | 's';
}

export interface HoleCardsMiniProps {
  cards: [Card, Card];
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

export const HoleCardsMini: React.FC<HoleCardsMiniProps> = ({ cards }) => {
  return (
    <div className="flex gap-0.5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="w-7 h-10 rounded bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center select-none"
        >
          <span className={`text-xs font-bold leading-none ${suitColors[card.suit]}`}>
            {card.rank}
          </span>
          <span className={`text-[9px] leading-none ${suitColors[card.suit]}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default HoleCardsMini;