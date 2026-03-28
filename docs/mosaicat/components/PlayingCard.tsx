import React from 'react';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';

interface PlayingCardProps {
  rank?: Rank;
  suit?: Suit;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const sizeClasses: Record<string, { card: string; rank: string; suit: string }> = {
  sm: { card: 'w-10 h-14 rounded-md', rank: 'text-xs', suit: 'text-[10px]' },
  md: { card: 'w-14 h-20 rounded-lg', rank: 'text-sm', suit: 'text-xs' },
  lg: { card: 'w-20 h-28 rounded-xl', rank: 'text-lg', suit: 'text-sm' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
}) => {
  const s = sizeClasses[size];

  if (faceDown || !rank || !suit) {
    return (
      <div
        className={`${s.card} bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-600 shadow-md flex items-center justify-center`}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-400/30 bg-blue-800/50 flex items-center justify-center">
          <span className="text-blue-300/60 text-lg font-bold">✦</span>
        </div>
      </div>
    );
  }

  const color = suitColors[suit];
  const symbol = suitSymbols[suit];

  return (
    <div
      className={`${s.card} bg-white border border-gray-200 shadow-md flex flex-col justify-between p-1 select-none`}
    >
      <div className={`flex flex-col items-start leading-none ${color}`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
      <div className={`${color} text-center`}>
        <span className={s.suit}>{symbol}</span>
      </div>
      <div className={`flex flex-col items-end leading-none ${color} rotate-180`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
    </div>
  );
};

export default PlayingCard;