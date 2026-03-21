import React from 'react';

export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface CommunityCardsProps {
  cards: Card[];
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
}

const SUIT_SYMBOLS: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

const STREET_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, street }) => {
  const totalSlots = 5;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Street label */}
      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
        {STREET_LABELS[street] ?? street}
      </div>

      {/* Cards row */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const card = cards[i];
          const isRevealed = !!card;

          return (
            <div
              key={i}
              className="relative w-16 h-[88px] perspective-[600px]"
            >
              <div
                className={`
                  absolute inset-0 transition-transform duration-500 ease-out
                  [transform-style:preserve-3d]
                  ${isRevealed ? '[transform:rotateY(0deg)]' : '[transform:rotateY(180deg)]'}
                `}
              >
                {/* Front face */}
                <div
                  className={`
                    absolute inset-0 rounded-md bg-white shadow-md
                    flex flex-col items-center justify-center
                    border border-gray-200 [backface-visibility:hidden]
                    ${card ? SUIT_COLORS[card.suit] : ''}
                  `}
                >
                  {card && (
                    <>
                      <span className="text-lg font-bold leading-none">{card.rank}</span>
                      <span className="text-xl leading-none mt-0.5">{SUIT_SYMBOLS[card.suit]}</span>
                    </>
                  )}
                </div>

                {/* Back face */}
                <div
                  className={`
                    absolute inset-0 rounded-md [backface-visibility:hidden] [transform:rotateY(180deg)]
                    ${isRevealed
                      ? 'bg-gradient-to-br from-emerald-700 to-emerald-900 border-2 border-emerald-600 shadow-md'
                      : 'border-2 border-dashed border-emerald-600/30 bg-emerald-900/20'
                    }
                    flex items-center justify-center
                  `}
                >
                  {!isRevealed ? null : (
                    <div className="w-10 h-14 rounded-sm border border-emerald-500/40 bg-emerald-800/50 flex items-center justify-center">
                      <span className="text-emerald-400/60 text-lg">♠</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityCards;