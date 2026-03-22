import React from 'react';

export interface CardProps {
  rank?: string;
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  faceUp?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const sizeClasses: Record<string, { card: string; rank: string; suit: string; centerSuit: string }> = {
  sm: { card: 'w-12 h-[4.2rem]', rank: 'text-xs', suit: 'text-[0.6rem]', centerSuit: 'text-lg' },
  md: { card: 'w-16 h-[5.6rem]', rank: 'text-sm', suit: 'text-xs', centerSuit: 'text-2xl' },
  lg: { card: 'w-24 h-[8.4rem]', rank: 'text-lg', suit: 'text-sm', centerSuit: 'text-4xl' },
};

export const Card: React.FC<CardProps> = ({
  rank,
  suit,
  faceUp = true,
  size = 'md',
  className = '',
}) => {
  const s = sizeClasses[size];

  if (!faceUp || !rank || !suit) {
    return (
      <div
        className={`${s.card} rounded-lg border border-gray-200 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 select-none ${className}`}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-400/30 bg-blue-700/50 flex items-center justify-center">
          <span className="text-blue-300/60 text-xs font-bold">★</span>
        </div>
      </div>
    );
  }

  const symbol = suitSymbols[suit];
  const color = suitColors[suit];

  return (
    <div
      className={`${s.card} rounded-lg border border-gray-200 shadow-sm bg-white flex flex-col justify-between p-1 select-none ${className}`}
    >
      <div className={`flex flex-col items-start leading-none ${color}`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
      <div className={`flex items-center justify-center ${color} ${s.centerSuit}`}>
        {symbol}
      </div>
      <div className={`flex flex-col items-end leading-none rotate-180 ${color}`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
    </div>
  );
};

export default Card;