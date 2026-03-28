import React from 'react';
import PlayingCard from './PlayingCard';

export interface Card {
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
  suit: 's' | 'h' | 'd' | 'c';
}

export interface CommunityCardsProps {
  cards: Card[];
}

const STREET_LABELS: Record<number, string> = {
  0: 'Preflop',
  3: 'Flop',
  4: 'Turn',
  5: 'River',
};

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  const streetLabel = STREET_LABELS[cards.length] ?? '';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Street label */}
      {streetLabel && (
        <span className="text-xs font-medium tracking-wide uppercase text-emerald-300/70">
          {streetLabel}
        </span>
      )}

      {/* Card slots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => {
          const card = cards[i];
          // Determine grouping divider: gap after flop (index 2)
          const extraGap = i === 3 ? 'ml-3' : '';

          return (
            <div
              key={i}
              className={`${extraGap}`}
            >
              {card ? (
                <PlayingCard rank={card.rank} suit={card.suit} size="md" />
              ) : (
                <div
                  className="w-[60px] h-[84px] rounded-lg border-2 border-dashed border-emerald-600/40 bg-emerald-900/30 flex items-center justify-center"
                  aria-label="Empty card slot"
                >
                  <span className="text-emerald-600/30 text-lg">?</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityCards;