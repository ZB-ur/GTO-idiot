import React from 'react';

interface CardDisplayProps {
  card?: { rank: string; suit: string };
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
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
  clubs: 'text-gray-50',
  spades: 'text-gray-50',
};

const sizeClasses: Record<string, { wrapper: string; rank: string; suit: string; centerSuit: string }> = {
  sm: { wrapper: 'w-10 h-14', rank: 'text-xs', suit: 'text-[8px]', centerSuit: 'text-lg' },
  md: { wrapper: 'w-14 h-20', rank: 'text-sm', suit: 'text-[10px]', centerSuit: 'text-2xl' },
  lg: { wrapper: 'w-20 h-28', rank: 'text-lg', suit: 'text-xs', centerSuit: 'text-4xl' },
};

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  faceDown = false,
  size = 'md',
  animate = false,
}) => {
  const s = sizeClasses[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${s.wrapper} rounded-lg shadow-md flex items-center justify-center
          bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600
          ${animate ? 'transition-transform duration-500 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="w-[70%] h-[75%] rounded border border-emerald-500/40 flex items-center justify-center">
          <span className="text-emerald-400/60 font-bold text-xs">GTO</span>
        </div>
      </div>
    );
  }

  const symbol = suitSymbols[card.suit] || '?';
  const color = suitColors[card.suit] || 'text-gray-50';

  return (
    <div
      className={`${s.wrapper} rounded-lg shadow-md bg-white border border-gray-200
        flex flex-col justify-between p-1 select-none
        ${animate ? 'transition-transform duration-500 [transform-style:preserve-3d]' : ''}`}
    >
      <div className={`flex flex-col items-start leading-none ${color}`}>
        <span className={`${s.rank} font-bold`}>{card.rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
      <div className={`flex items-center justify-center ${color} ${s.centerSuit}`}>
        {symbol}
      </div>
      <div className={`flex flex-col items-end leading-none rotate-180 ${color}`}>
        <span className={`${s.rank} font-bold`}>{card.rank}</span>
        <span className={s.suit}>{symbol}</span>
      </div>
    </div>
  );
};

export default CardDisplay;