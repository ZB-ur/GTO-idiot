import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface HoleCardsProps {
  cards?: Card[];
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SUIT_SYMBOLS: Record<string, { char: string; color: string }> = {
  hearts: { char: '\u2665', color: 'text-red-500' },
  diamonds: { char: '\u2666', color: 'text-red-500' },
  clubs: { char: '\u2663', color: 'text-gray-900' },
  spades: { char: '\u2660', color: 'text-gray-900' },
};

const SIZE_MAP = {
  sm: { card: 'w-10 h-14', rank: 'text-sm', suit: 'text-xs', gap: 'gap-1' },
  md: { card: 'w-14 h-20', rank: 'text-lg', suit: 'text-sm', gap: 'gap-1.5' },
  lg: { card: 'w-20 h-28', rank: 'text-2xl', suit: 'text-lg', gap: 'gap-2' },
};

const CardFace: React.FC<{ card: Card; sizeKey: 'sm' | 'md' | 'lg' }> = ({ card, sizeKey }) => {
  const sizes = SIZE_MAP[sizeKey];
  const suitInfo = SUIT_SYMBOLS[card.suit] ?? { char: '?', color: 'text-gray-500' };

  return (
    <div
      className={`${sizes.card} flex flex-col items-center justify-center rounded-lg bg-gray-100 shadow-md border border-gray-200`}
    >
      <span className={`${sizes.rank} font-bold ${suitInfo.color} leading-none`}>
        {card.rank}
      </span>
      <span className={`${sizes.suit} ${suitInfo.color} leading-none`}>
        {suitInfo.char}
      </span>
    </div>
  );
};

const CardBack: React.FC<{ sizeKey: 'sm' | 'md' | 'lg' }> = ({ sizeKey }) => {
  const sizes = SIZE_MAP[sizeKey];

  return (
    <div
      className={`${sizes.card} flex items-center justify-center rounded-lg border-2 border-gray-600 shadow-md`}
      style={{
        background: 'repeating-linear-gradient(135deg, #1e3a5f, #1e3a5f 4px, #1a3050 4px, #1a3050 8px)',
      }}
    >
      <div className="w-3/5 h-3/5 rounded-md border border-gray-500 bg-gray-800/60" />
    </div>
  );
};

export const HoleCards: React.FC<HoleCardsProps> = ({
  cards,
  faceDown = false,
  size = 'md',
}) => {
  const sizes = SIZE_MAP[size];
  const showFaceDown = faceDown || !cards || cards.length < 2;

  return (
    <div className={`inline-flex ${sizes.gap}`}>
      {showFaceDown ? (
        <>
          <CardBack sizeKey={size} />
          <CardBack sizeKey={size} />
        </>
      ) : (
        <>
          <CardFace card={cards[0]} sizeKey={size} />
          <CardFace card={cards[1]} sizeKey={size} />
        </>
      )}
    </div>
  );
};

export default HoleCards;