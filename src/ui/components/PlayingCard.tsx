import React from 'react';
import type { Card } from '../../types';

export interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, { card: string; rank: string; suit: string }> = {
  sm: { card: 'w-10 h-14 text-xs', rank: 'text-sm', suit: 'text-xs' },
  md: { card: 'w-14 h-20 text-sm', rank: 'text-base', suit: 'text-sm' },
  lg: { card: 'w-20 h-28 text-lg', rank: 'text-xl', suit: 'text-lg' },
};

const suitSymbols: Record<string, string> = {
  s: '\u2660',
  h: '\u2665',
  d: '\u2666',
  c: '\u2663',
};

const suitColors: Record<string, string> = {
  s: 'text-suit-spade',
  h: 'text-suit-heart',
  d: 'text-suit-diamond',
  c: 'text-suit-club',
};

const PlayingCard: React.FC<PlayingCardProps> = ({ card, faceDown = false, size = 'md' }) => {
  const sizes = sizeClasses[size];

  if (faceDown || !card) {
    return (
      <div
        className={`
          ${sizes.card} rounded-card shadow-card
          flex items-center justify-center
          bg-gradient-to-br from-blue-800 to-blue-950
          border border-blue-700
          select-none
        `}
        aria-label="Face-down card"
      >
        <div className="w-3/4 h-3/4 rounded-sm border border-blue-600/40 bg-blue-900/50 flex items-center justify-center">
          <span className="text-blue-400/60 font-bold">&#9824;</span>
        </div>
      </div>
    );
  }

  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div
      className={`
        ${sizes.card} rounded-card shadow-card
        flex flex-col justify-between p-1
        bg-white border border-slate-300
        select-none animate-deal
      `}
      aria-label={`${card.rank} of ${card.suit === 's' ? 'spades' : card.suit === 'h' ? 'hearts' : card.suit === 'd' ? 'diamonds' : 'clubs'}`}
    >
      <div className={`flex flex-col items-start leading-none ${suitColor}`}>
        <span className={`${sizes.rank} font-bold`}>{card.rank}</span>
        <span className={sizes.suit}>{suitSymbol}</span>
      </div>
      <div className={`flex items-center justify-center ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        <span className={sizes.suit}>{suitSymbol}</span>
      </div>
      <div className={`flex flex-col items-end leading-none rotate-180 ${suitColor}`}>
        <span className={`${sizes.rank} font-bold`}>{card.rank}</span>
        <span className={sizes.suit}>{suitSymbol}</span>
      </div>
    </div>
  );
};

export default PlayingCard;
