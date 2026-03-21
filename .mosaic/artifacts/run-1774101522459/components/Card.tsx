import React from 'react';

export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Suit = 's' | 'h' | 'd' | 'c';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  rank?: Rank;
  suit?: Suit;
  faceDown?: boolean;
  size?: CardSize;
  animate?: boolean;
}

const suitSymbols: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitNames: Record<Suit, string> = {
  s: 'spade',
  h: 'heart',
  d: 'diamond',
  c: 'club',
};

const isRedSuit = (suit: Suit): boolean => suit === 'h' || suit === 'd';

const sizeClasses: Record<CardSize, { card: string; rank: string; suitTop: string; suitCenter: string }> = {
  sm: { card: 'w-10 h-14', rank: 'text-xs', suitTop: 'text-[10px]', suitCenter: 'text-lg' },
  md: { card: 'w-16 h-22', rank: 'text-sm', suitTop: 'text-xs', suitCenter: 'text-2xl' },
  lg: { card: 'w-24 h-34', rank: 'text-lg', suitTop: 'text-sm', suitCenter: 'text-4xl' },
};

export const Card: React.FC<CardProps> = ({
  rank,
  suit,
  faceDown = false,
  size = 'md',
  animate = false,
}) => {
  const s = sizeClasses[size];
  const showFace = !faceDown && rank && suit;

  return (
    <div
      className={`
        ${s.card} rounded-lg border border-gray-200 shadow-sm
        inline-flex flex-col select-none
        ${animate ? 'transition-transform duration-300 ease-in-out' : ''}
        ${faceDown
          ? 'bg-gradient-to-br from-blue-600 to-blue-800'
          : 'bg-white'
        }
      `}
      role="img"
      aria-label={showFace ? `${rank} of ${suitNames[suit!]}s` : 'Card face down'}
    >
      {showFace ? (
        <>
          <div className={`flex items-center gap-0.5 pl-1 pt-0.5 font-bold ${isRedSuit(suit!) ? 'text-red-600' : 'text-gray-900'}`}>
            <span className={s.rank}>{rank}</span>
            <span className={s.suitTop}>{suitSymbols[suit!]}</span>
          </div>
          <div className={`flex-1 flex items-center justify-center ${isRedSuit(suit!) ? 'text-red-600' : 'text-gray-900'}`}>
            <span className={s.suitCenter}>{suitSymbols[suit!]}</span>
          </div>
        </>
      ) : (
        <div className="flex-1 rounded-md m-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
      )}
    </div>
  );
};

export default Card;