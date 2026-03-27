import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface HoleCardsProps {
  cards: Card[] | null;
  faceUp: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { width: 'w-10', height: 'h-14', text: 'text-sm', overlap: '-ml-3' },
  md: { width: 'w-14', height: 'h-20', text: 'text-lg', overlap: '-ml-4' },
  lg: { width: 'w-20', height: 'h-28', text: 'text-2xl', overlap: '-ml-5' },
};

const suitSymbols: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

function CardFace({ card, size }: { card: Card; size: 'sm' | 'md' | 'lg' }) {
  const cfg = sizeConfig[size];
  const color = suitColors[card.suit];

  return (
    <div
      className={`${cfg.width} ${cfg.height} bg-white rounded-lg shadow-md flex flex-col items-center justify-center border border-gray-200 select-none`}
    >
      <span className={`${cfg.text} font-bold ${color} leading-none`}>
        {card.rank}
      </span>
      <span className={`${cfg.text} ${color} leading-none`}>
        {suitSymbols[card.suit]}
      </span>
    </div>
  );
}

function CardBack({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const cfg = sizeConfig[size];

  return (
    <div
      className={`${cfg.width} ${cfg.height} rounded-lg shadow-md border border-gray-600 bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center select-none`}
    >
      <div className="w-3/4 h-3/4 rounded border border-blue-400/30 bg-blue-900/50 flex items-center justify-center">
        <span className="text-blue-400/40 text-xs font-bold">♠</span>
      </div>
    </div>
  );
}

export const HoleCards: React.FC<HoleCardsProps> = ({
  cards,
  faceUp,
  size = 'md',
}) => {
  const cfg = sizeConfig[size];

  if (!cards && faceUp) {
    return null;
  }

  return (
    <div className="flex items-center">
      {faceUp && cards ? (
        <>
          <CardFace card={cards[0]} size={size} />
          <div className={cfg.overlap}>
            <CardFace card={cards[1]} size={size} />
          </div>
        </>
      ) : (
        <>
          <CardBack size={size} />
          <div className={cfg.overlap}>
            <CardBack size={size} />
          </div>
        </>
      )}
    </div>
  );
};

export default HoleCards;