import React from 'react';

type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
type Suit = 's' | 'h' | 'd' | 'c';
type CardSize = 'sm' | 'md' | 'lg';

interface CardFaceProps {
  rank: Rank;
  suit: Suit;
  size?: CardSize;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

const SIZE_MAP: Record<CardSize, { w: string; h: string; rankText: string; suitText: string; centerText: string }> = {
  sm: { w: 'w-10', h: 'h-14', rankText: 'text-[10px]', suitText: 'text-[8px]', centerText: 'text-lg' },
  md: { w: 'w-14', h: 'h-20', rankText: 'text-xs', suitText: 'text-[10px]', centerText: 'text-2xl' },
  lg: { w: 'w-20', h: 'h-28', rankText: 'text-sm', suitText: 'text-xs', centerText: 'text-4xl' },
};

export const CardFace: React.FC<CardFaceProps> = ({ rank, suit, size = 'md' }) => {
  const suitSymbol = SUIT_SYMBOLS[suit];
  const colorClass = SUIT_COLORS[suit];
  const s = SIZE_MAP[size];

  return (
    <div
      className={`${s.w} ${s.h} relative bg-white rounded-lg shadow-md border border-gray-300 flex items-center justify-center select-none overflow-hidden`}
    >
      {/* Top-left rank + suit */}
      <div className={`absolute top-0.5 left-1 flex flex-col items-center leading-none ${colorClass}`}>
        <span className={`${s.rankText} font-bold`}>{rank}</span>
        <span className={s.suitText}>{suitSymbol}</span>
      </div>

      {/* Center suit */}
      <span className={`${s.centerText} ${colorClass}`}>{suitSymbol}</span>

      {/* Bottom-right rank + suit (inverted) */}
      <div className={`absolute bottom-0.5 right-1 flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className={`${s.rankText} font-bold`}>{rank}</span>
        <span className={s.suitText}>{suitSymbol}</span>
      </div>
    </div>
  );
};

export default CardFace;