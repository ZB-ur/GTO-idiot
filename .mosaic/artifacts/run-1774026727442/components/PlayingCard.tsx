import React from 'react';

export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface PlayingCardProps {
  card?: { rank: Rank; suit: Suit };
  faceDown?: boolean;
  flipping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

const sizeMap = {
  sm: { w: 'w-12', h: 'h-[68px]', text: 'text-sm', suit: 'text-base' },
  md: { w: 'w-16', h: 'h-[92px]', text: 'text-lg', suit: 'text-xl' },
  lg: { w: 'w-20', h: 'h-[116px]', text: 'text-xl', suit: 'text-2xl' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  flipping = false,
  size = 'md',
}) => {
  const s = sizeMap[size];
  const showBack = faceDown || !card;

  return (
    <div
      className={`
        ${s.w} ${s.h} rounded-md select-none inline-flex
        ${flipping ? 'animate-flip' : ''}
        ${showBack
          ? 'bg-gradient-to-br from-emerald-700 to-emerald-900 border-2 border-emerald-600'
          : 'bg-white border border-gray-300 shadow-sm'
        }
      `}
      style={{ perspective: '600px' }}
    >
      {showBack ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[70%] h-[80%] rounded-sm border border-emerald-500/40 bg-emerald-800/50
            flex items-center justify-center">
            <span className="text-emerald-400/60 text-xs font-bold">♠♥♦♣</span>
          </div>
        </div>
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center ${suitColors[card!.suit]}`}>
          <span className={`${s.text} font-bold leading-none`}>{card!.rank}</span>
          <span className={`${s.suit} leading-none`}>{suitSymbols[card!.suit]}</span>
        </div>
      )}
    </div>
  );
};

export default PlayingCard;