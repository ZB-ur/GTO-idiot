import React from 'react';

export interface CardComponentProps {
  rank?: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
  suit?: 's' | 'h' | 'd' | 'c';
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const RANK_DISPLAY: Record<string, string> = {
  A: 'A', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', T: '10',
  J: 'J', Q: 'Q', K: 'K',
};

const SIZE_MAP = {
  sm: { card: 'w-10 h-14', rank: 'text-xs', suit: 'text-sm', centerSuit: 'text-lg' },
  md: { card: 'w-16 h-22', rank: 'text-sm', suit: 'text-base', centerSuit: 'text-2xl' },
  lg: { card: 'w-24 h-34', rank: 'text-lg', suit: 'text-xl', centerSuit: 'text-4xl' },
};

export const CardComponent: React.FC<CardComponentProps> = ({
  rank = 'A',
  suit = 's',
  faceDown = false,
  size = 'md',
  className = '',
}) => {
  const s = SIZE_MAP[size];
  const isRed = suit === 'h' || suit === 'd';
  const colorClass = isRed ? 'text-red-500' : 'text-gray-100';

  if (faceDown) {
    return (
      <div
        className={`${s.card} rounded-lg bg-gradient-to-br from-sky-800 to-sky-950 border border-sky-600 flex items-center justify-center shadow-md ${className}`}
      >
        <div className="w-[70%] h-[75%] rounded border border-sky-500/40 bg-sky-900/60 flex items-center justify-center">
          <span className="text-sky-400/50 text-lg font-bold">✦</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${s.card} rounded-lg bg-white border border-gray-300 flex flex-col justify-between p-1 shadow-md relative ${colorClass} ${className}`}
    >
      {/* Top-left corner */}
      <div className="flex flex-col items-center leading-none">
        <span className={`${s.rank} font-bold`}>{RANK_DISPLAY[rank]}</span>
        <span className={s.suit}>{SUIT_SYMBOLS[suit]}</span>
      </div>
      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={s.centerSuit}>{SUIT_SYMBOLS[suit]}</span>
      </div>
      {/* Bottom-right corner (rotated) */}
      <div className="flex flex-col items-center leading-none rotate-180">
        <span className={`${s.rank} font-bold`}>{RANK_DISPLAY[rank]}</span>
        <span className={s.suit}>{SUIT_SYMBOLS[suit]}</span>
      </div>
    </div>
  );
};

export default CardComponent;