import React from 'react';

interface CardData {
  rank: string;
  suit: string;
}

interface CommunityBoardProps {
  cards: CardData[];
  className?: string;
}

const suitSymbol: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
  h: '♥', d: '♦', c: '♣', s: '♠',
};

const suitColor: Record<string, string> = {
  hearts: 'text-red-500', diamonds: 'text-red-500',
  clubs: 'text-gray-900', spades: 'text-gray-900',
  h: 'text-red-500', d: 'text-red-500',
  c: 'text-gray-900', s: 'text-gray-900',
};

export function CommunityBoard({ cards, className = '' }: CommunityBoardProps) {
  const emptySlots = Math.max(0, 5 - cards.length);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {cards.map((card, i) => {
        const symbol = suitSymbol[card.suit] ?? card.suit;
        const color = suitColor[card.suit] ?? 'text-gray-900';
        return (
          <div
            key={i}
            className="w-14 h-20 rounded-lg bg-gray-50 border border-gray-200 shadow-md flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-105"
          >
            <span className={`text-base font-bold leading-none ${color}`}>{card.rank}</span>
            <span className={`text-xl leading-none ${color}`}>{symbol}</span>
          </div>
        );
      })}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-14 h-20 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 flex items-center justify-center"
        >
          <span className="text-gray-600 text-xs">?</span>
        </div>
      ))}
    </div>
  );
}