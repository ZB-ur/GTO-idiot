import React from 'react';

interface PlayingCardProps {
  card?: { rank: string; suit: string };
  faceDown?: boolean;
  flipping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900',
};

const sizeClasses: Record<string, { card: string; rank: string; suit: string }> = {
  sm: { card: 'w-10 h-14 rounded-md text-xs', rank: 'text-xs', suit: 'text-sm' },
  md: { card: 'w-16 h-22 rounded-lg text-sm', rank: 'text-sm', suit: 'text-xl' },
  lg: { card: 'w-24 h-34 rounded-xl text-base', rank: 'text-lg', suit: 'text-3xl' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  flipping = false,
  size = 'md',
}) => {
  const s = sizeClasses[size];
  const showBack = faceDown || !card;

  return (
    <div
      className={`
        ${s.card} relative inline-flex flex-col items-center justify-center
        border border-gray-200 shadow-sm select-none
        transition-transform duration-300
        ${flipping ? 'animate-flip' : ''}
        ${showBack
          ? 'bg-gradient-to-br from-blue-600 to-blue-800'
          : 'bg-white'
        }
      `}
      style={{ perspective: '600px' }}
    >
      {showBack ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded border border-blue-400/40 bg-blue-700/30 flex items-center justify-center">
            <span className="text-blue-300/60 text-lg font-bold">♠</span>
          </div>
        </div>
      ) : (
        <>
          <span className={`absolute top-1 left-1.5 font-bold leading-none ${s.rank} ${suitColors[card.suit]}`}>
            {card.rank}
          </span>
          <span className={`${s.suit} ${suitColors[card.suit]}`}>
            {suitSymbols[card.suit]}
          </span>
          <span className={`absolute bottom-1 right-1.5 font-bold leading-none rotate-180 ${s.rank} ${suitColors[card.suit]}`}>
            {card.rank}
          </span>
        </>
      )}
    </div>
  );
};

export default PlayingCard;