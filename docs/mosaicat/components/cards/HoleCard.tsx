import React from 'react';

interface HoleCardProps {
  card?: { rank: string; suit: string };
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: { width: 'w-10', height: 'h-14', text: 'text-sm', suit: 'text-xs' },
  md: { width: 'w-14', height: 'h-20', text: 'text-lg', suit: 'text-sm' },
  lg: { width: 'w-20', height: 'h-28', text: 'text-2xl', suit: 'text-lg' },
};

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

const isRedSuit = (suit: string): boolean => {
  const s = suit.toLowerCase();
  return s === 'hearts' || s === 'diamonds' || s === 'h' || s === 'd';
};

const HoleCard: React.FC<HoleCardProps> = ({
  card,
  faceDown = false,
  size = 'md',
  className = '',
}) => {
  const s = sizeStyles[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${s.width} ${s.height} flex items-center justify-center rounded-lg border border-gray-300 bg-gradient-to-br from-blue-700 to-blue-900 shadow-md ${className}`}
      >
        <div className="h-3/4 w-3/4 rounded-md border border-blue-400/30 bg-blue-800/50" />
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = suitSymbols[card.suit.toLowerCase()] || card.suit;
  const colorClass = red ? 'text-red-600' : 'text-gray-900';

  return (
    <div
      className={`${s.width} ${s.height} relative flex flex-col items-center justify-between rounded-lg border border-gray-200 bg-white p-1 shadow-md ${className}`}
    >
      <div className={`self-start leading-none ${colorClass}`}>
        <div className={`${s.text} font-bold`}>{card.rank}</div>
        <div className={s.suit}>{symbol}</div>
      </div>
      <div className={`${s.suit} ${colorClass} absolute bottom-1 right-1 rotate-180 self-end leading-none`}>
        <div className={`${s.text} font-bold`}>{card.rank}</div>
        <div className={s.suit}>{symbol}</div>
      </div>
    </div>
  );
};

export default HoleCard;