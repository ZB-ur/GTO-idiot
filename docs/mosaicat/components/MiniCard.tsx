import React from 'react';

interface CardData {
  rank: string;
  suit: string;
}

interface MiniCardProps {
  card: CardData;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  className?: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
  '♥': '♥',
  '♦': '♦',
  '♣': '♣',
  '♠': '♠',
};

const RED_SUITS = new Set(['hearts', 'diamonds', 'h', 'd', '♥', '♦']);

const SIZE_CLASSES: Record<string, { container: string; rank: string; suit: string }> = {
  sm: { container: 'w-8 h-11', rank: 'text-xs', suit: 'text-[10px]' },
  md: { container: 'w-10 h-14', rank: 'text-sm', suit: 'text-xs' },
  lg: { container: 'w-14 h-20', rank: 'text-lg', suit: 'text-sm' },
};

export const MiniCard: React.FC<MiniCardProps> = ({
  card,
  size = 'md',
  faceDown = false,
  className = '',
}) => {
  const sizeStyle = SIZE_CLASSES[size];
  const isRed = RED_SUITS.has(card.suit.toLowerCase());
  const suitSymbol = SUIT_SYMBOLS[card.suit.toLowerCase()] ?? card.suit;

  if (faceDown) {
    return (
      <div
        className={`${sizeStyle.container} rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/50 shadow-lg shadow-black/40 flex items-center justify-center ${className}`}
      >
        <div className="w-[70%] h-[75%] rounded border border-amber-300/30 bg-amber-600/40" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeStyle.container} rounded-lg bg-white border border-gray-300 shadow-lg shadow-black/40 flex flex-col items-center justify-center gap-0 select-none ${className}`}
    >
      <span className={`${sizeStyle.rank} font-bold leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {card.rank}
      </span>
      <span className={`${sizeStyle.suit} leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {suitSymbol}
      </span>
    </div>
  );
};