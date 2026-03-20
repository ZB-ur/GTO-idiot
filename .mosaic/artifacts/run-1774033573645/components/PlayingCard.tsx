import React from 'react';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 's' | 'h' | 'd' | 'c';

interface PlayingCardProps {
  rank?: Rank;
  suit?: Suit;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const suitSymbols: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-emerald-600',
};

const sizeMap = {
  sm: { card: 'w-10 h-14', rank: 'text-xs', suit: 'text-xs', centerSuit: 'text-lg' },
  md: { card: 'w-16 h-22', rank: 'text-sm', suit: 'text-sm', centerSuit: 'text-2xl' },
  lg: { card: 'w-24 h-34', rank: 'text-lg', suit: 'text-base', centerSuit: 'text-4xl' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  animated = false,
  className = '',
}) => {
  const s = sizeMap[size];
  const showFace = !faceDown && rank && suit;

  return (
    <div
      className={`
        ${s.card} rounded-lg border border-gray-200 shadow-sm
        inline-flex flex-col items-center justify-between
        select-none overflow-hidden
        ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}
        ${showFace ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-blue-800'}
        ${className}
      `}
      style={{ perspective: '600px' }}
    >
      {showFace ? (
        <>
          <div className={`self-start pl-1 pt-0.5 leading-none ${suitColors[suit!]}`}>
            <div className={`${s.rank} font-bold`}>{rank}</div>
            <div className={`${s.suit} -mt-0.5`}>{suitSymbols[suit!]}</div>
          </div>
          <div className={`${s.centerSuit} ${suitColors[suit!]} -mt-2`}>
            {suitSymbols[suit!]}
          </div>
          <div className={`self-end pr-1 pb-0.5 leading-none rotate-180 ${suitColors[suit!]}`}>
            <div className={`${s.rank} font-bold`}>{rank}</div>
            <div className={`${s.suit} -mt-0.5`}>{suitSymbols[suit!]}</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[80%] h-[85%] rounded border border-blue-400/30 bg-blue-700/50 flex items-center justify-center">
            <span className="text-blue-200/60 text-lg font-bold">♠</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayingCard;