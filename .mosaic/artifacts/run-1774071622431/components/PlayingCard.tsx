import React from 'react';

interface PlayingCardProps {
  rank?: 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
  suit?: 's' | 'h' | 'd' | 'c';
  faceDown?: boolean;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-700',
};

const sizeClasses: Record<string, { card: string; rank: string; suit: string; centerSuit: string }> = {
  sm: { card: 'w-10 h-14', rank: 'text-xs', suit: 'text-[8px]', centerSuit: 'text-lg' },
  md: { card: 'w-16 h-22', rank: 'text-sm', suit: 'text-xs', centerSuit: 'text-2xl' },
  lg: { card: 'w-20 h-28', rank: 'text-lg', suit: 'text-sm', centerSuit: 'text-4xl' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  faceDown = false,
  highlight = false,
  size = 'md',
}) => {
  const s = sizeClasses[size];
  const color = suit ? suitColors[suit] : 'text-gray-900';
  const symbol = suit ? suitSymbols[suit] : '';

  if (faceDown) {
    return (
      <div
        className={`${s.card} rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-700 to-blue-900 shadow-sm flex items-center justify-center select-none`}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-400/30 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]" />
      </div>
    );
  }

  return (
    <div
      className={`${s.card} rounded-lg border-2 ${
        highlight ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-gray-300'
      } bg-white shadow-sm flex flex-col justify-between p-1 select-none relative`}
    >
      {/* Top-left rank + suit */}
      <div className={`flex flex-col items-center leading-none ${color}`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
      {/* Center suit */}
      <div className={`absolute inset-0 flex items-center justify-center ${color} opacity-20`}>
        <span className={s.centerSuit}>{symbol}</span>
      </div>
      {/* Bottom-right rank + suit (inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${color}`}>
        <span className={`${s.rank} font-bold`}>{rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
    </div>
  );
};

export default PlayingCard;