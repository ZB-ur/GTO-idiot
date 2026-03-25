import React from 'react';

export interface CardData {
  rank: string;
  suit: string;
}

export interface CommunityCardAreaProps {
  cards: CardData[];
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

function getStreetLabel(street: string): string {
  switch (street) {
    case 'preflop': return 'Pre-Flop';
    case 'flop': return 'Flop';
    case 'turn': return 'Turn';
    case 'river': return 'River';
    case 'showdown': return 'Showdown';
    default: return '';
  }
}

function getNewCardIndex(street: string): number {
  switch (street) {
    case 'turn': return 3;
    case 'river': return 4;
    default: return -1;
  }
}

const CommunityCard: React.FC<{ card: CardData; isNew?: boolean; delay?: number }> = ({
  card,
  isNew = false,
  delay = 0,
}) => {
  const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
  const suitColor = SUIT_COLORS[card.suit] || 'text-gray-900';

  return (
    <div
      className={`
        relative w-16 h-[5.5rem] bg-white rounded-lg shadow-md border border-gray-200
        flex flex-col items-center justify-center select-none
        transition-all duration-500 ease-out
        ${isNew ? 'animate-deal-card' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top-left rank + suit */}
      <div className={`absolute top-1 left-1.5 text-xs font-bold leading-none ${suitColor}`}>
        <div>{card.rank}</div>
        <div className="text-[10px]">{suitSymbol}</div>
      </div>

      {/* Center suit */}
      <div className={`text-2xl ${suitColor}`}>{suitSymbol}</div>

      {/* Bottom-right rank + suit (inverted) */}
      <div className={`absolute bottom-1 right-1.5 text-xs font-bold leading-none rotate-180 ${suitColor}`}>
        <div>{card.rank}</div>
        <div className="text-[10px]">{suitSymbol}</div>
      </div>
    </div>
  );
};

const PlaceholderCard: React.FC = () => (
  <div className="w-16 h-[5.5rem] rounded-lg border-2 border-dashed border-emerald-600/30 bg-emerald-900/20" />
);

export const CommunityCardArea: React.FC<CommunityCardAreaProps> = ({ cards, street }) => {
  const totalSlots = 5;
  const newCardIndex = getNewCardIndex(street);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Street label */}
      <div className="px-3 py-1 rounded-full bg-emerald-900/60 backdrop-blur-sm">
        <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
          {getStreetLabel(street)}
        </span>
      </div>

      {/* Cards row */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => {
          if (i < cards.length) {
            const isFlop = street === 'flop' && i < 3;
            const isNew = i === newCardIndex || isFlop;
            return (
              <CommunityCard
                key={`${cards[i].rank}-${cards[i].suit}-${i}`}
                card={cards[i]}
                isNew={isNew}
                delay={isFlop ? i * 150 : 0}
              />
            );
          }
          return <PlaceholderCard key={`placeholder-${i}`} />;
        })}
      </div>
    </div>
  );
};

export default CommunityCardArea;