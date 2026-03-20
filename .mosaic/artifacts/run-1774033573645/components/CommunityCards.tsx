import React from 'react';

export interface Card {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 's' | 'h' | 'd' | 'c';
}

export interface CommunityCardsProps {
  cards: Card[];
  animated?: boolean;
}

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const SUIT_COLORS: Record<Card['suit'], string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-emerald-600',
};

const STREET_LABELS: Record<number, string> = {
  0: 'Preflop',
  3: 'Flop',
  4: 'Turn',
  5: 'River',
};

/**
 * CommunityCards — displays up to 5 community cards on the poker table.
 * Cards appear by street (flop=3, turn=1, river=1) with optional flip animation.
 */
export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  animated = true,
}) => {
  const streetLabel = STREET_LABELS[cards.length] ?? (cards.length > 0 ? '' : 'Preflop');

  // Determine animation delay per card based on street grouping
  const getAnimationDelay = (index: number): string => {
    if (!animated) return '0ms';
    // Flop cards: stagger 0/100/200ms; Turn: 0ms; River: 0ms
    if (index < 3) return `${index * 120}ms`;
    return '0ms';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Street indicator */}
      {streetLabel && (
        <span className="text-xs font-medium tracking-wide uppercase text-emerald-300/70">
          {streetLabel}
        </span>
      )}

      {/* Card slots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const card = cards[i];
          const isDealt = !!card;

          return (
            <div
              key={i}
              className="relative"
              style={{
                perspective: '600px',
                width: 64,
                height: 88,
              }}
            >
              {isDealt ? (
                <div
                  className={`
                    w-full h-full rounded-lg bg-white border border-gray-200
                    shadow-md flex flex-col items-center justify-center
                    ${animated ? 'animate-flip-in' : ''}
                  `}
                  style={{
                    animationDelay: getAnimationDelay(i),
                    animationFillMode: 'both',
                  }}
                >
                  <span
                    className={`text-lg font-bold leading-none ${SUIT_COLORS[card.suit]}`}
                  >
                    {card.rank}
                  </span>
                  <span
                    className={`text-xl leading-none mt-0.5 ${SUIT_COLORS[card.suit]}`}
                  >
                    {SUIT_SYMBOLS[card.suit]}
                  </span>
                </div>
              ) : (
                /* Empty slot placeholder */
                <div className="w-full h-full rounded-lg border-2 border-dashed border-emerald-600/30 bg-emerald-900/20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityCards;