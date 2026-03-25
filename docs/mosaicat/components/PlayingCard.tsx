import React from 'react';

type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardSize = 'sm' | 'md' | 'lg';

interface PlayingCardProps {
  rank?: Rank;
  suit?: Suit;
  faceUp?: boolean;
  highlighted?: boolean;
  size?: CardSize;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#ecf0f1',
  spades: '#ecf0f1',
};

const sizeClasses: Record<CardSize, { card: string; rank: string; suit: string; center: string }> = {
  sm: { card: 'w-10 h-14', rank: 'text-xs', suit: 'text-[10px]', center: 'text-lg' },
  md: { card: 'w-16 h-22', rank: 'text-sm', suit: 'text-xs', center: 'text-2xl' },
  lg: { card: 'w-24 h-34', rank: 'text-lg', suit: 'text-base', center: 'text-4xl' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceUp = true,
  highlighted = false,
  size = 'md',
}) => {
  const s = sizeClasses[size];
  const color = suit ? suitColors[suit] : '#ecf0f1';
  const symbol = suit ? suitSymbols[suit] : '';

  if (!faceUp || !rank || !suit) {
    return (
      <div
        className={`${s.card} rounded-md border-2 flex items-center justify-center select-none ${
          highlighted ? 'border-emerald-400 shadow-lg shadow-emerald-500/30' : 'border-gray-600'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 50%, #1e3a5f 100%)',
        }}
      >
        <div className="text-blue-300/40 text-lg font-bold">&#x2663;</div>
      </div>
    );
  }

  return (
    <div
      className={`${s.card} rounded-md border-2 flex flex-col justify-between p-1 select-none bg-white ${
        highlighted
          ? 'border-emerald-400 shadow-lg shadow-emerald-500/30 -translate-y-1'
          : 'border-gray-300'
      } transition-all duration-200`}
    >
      <div className="flex flex-col items-start leading-none">
        <span className={`${s.rank} font-bold`} style={{ color }}>
          {rank}
        </span>
        <span className={s.suit} style={{ color }}>
          {symbol}
        </span>
      </div>
      <div className={`${s.center} self-center`} style={{ color }}>
        {symbol}
      </div>
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`${s.rank} font-bold`} style={{ color }}>
          {rank}
        </span>
        <span className={s.suit} style={{ color }}>
          {symbol}
        </span>
      </div>
    </div>
  );
};

export default PlayingCard;