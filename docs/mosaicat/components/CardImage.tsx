import React from 'react';

interface CardImageProps {
  card?: { rank: string; suit: string };
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { w: 'w-10', h: 'h-14', text: 'text-xs', suit: 'text-sm' },
  md: { w: 'w-14', h: 'h-20', text: 'text-sm', suit: 'text-base' },
  lg: { w: 'w-20', h: 'h-28', text: 'text-lg', suit: 'text-xl' },
};

const suitSymbols: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
  h: '♥', d: '♦', c: '♣', s: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500', diamonds: 'text-red-500',
  clubs: 'text-gray-900', spades: 'text-gray-900',
  h: 'text-red-500', d: 'text-red-500',
  c: 'text-gray-900', s: 'text-gray-900',
};

export const CardImage: React.FC<CardImageProps> = ({
  card,
  faceDown = false,
  size = 'md',
}) => {
  const s = sizeMap[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${s.w} ${s.h} rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600 shadow-md flex items-center justify-center`}
      >
        <div className="w-3/4 h-3/4 rounded border border-emerald-500/40 bg-emerald-800/50 flex items-center justify-center">
          <span className="text-emerald-400/60 text-xs font-bold">♠</span>
        </div>
      </div>
    );
  }

  const symbol = suitSymbols[card.suit.toLowerCase()] ?? card.suit;
  const color = suitColors[card.suit.toLowerCase()] ?? 'text-gray-900';

  return (
    <div
      className={`${s.w} ${s.h} rounded-lg bg-gray-100 border border-gray-300 shadow-md flex flex-col items-center justify-between p-1 select-none`}
    >
      <div className={`self-start leading-none ${color}`}>
        <div className={`${s.text} font-bold`}>{card.rank}</div>
        <div className={`${s.suit} -mt-0.5`}>{symbol}</div>
      </div>
      <div className={`${color} text-2xl leading-none`}>
        {symbol}
      </div>
      <div className={`self-end leading-none rotate-180 ${color}`}>
        <div className={`${s.text} font-bold`}>{card.rank}</div>
        <div className={`${s.suit} -mt-0.5`}>{symbol}</div>
      </div>
    </div>
  );
};

export default CardImage;