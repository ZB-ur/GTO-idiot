import React from 'react';

export interface CardData {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

interface CommunityCardsProps {
  cards: CardData[];
  revealStreet: Street;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-emerald-700',
  spades: 'text-gray-900',
};

const streetCardCounts: Record<Street, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
  showdown: 5,
};

function CardComponent({
  card,
  revealed,
  index,
}: {
  card?: CardData;
  revealed: boolean;
  index: number;
}) {
  if (!revealed || !card) {
    return (
      <div
        className="w-16 h-[88px] rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-600 shadow-md flex items-center justify-center transition-all duration-500"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="w-10 h-14 rounded-lg border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }

  return (
    <div
      className="w-16 h-[88px] rounded-xl bg-white border-2 border-gray-200 shadow-md flex flex-col items-center justify-center gap-0.5 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className={`text-lg font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
      <span className={`text-2xl leading-none ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </span>
    </div>
  );
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, revealStreet }) => {
  const revealedCount = streetCardCounts[revealStreet];
  const totalSlots = 5;

  return (
    <div className="flex items-center justify-center">
      <div className="flex gap-2 p-4 rounded-2xl bg-emerald-900/40 backdrop-blur-sm">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const card = cards[i];
          const isRevealed = i < revealedCount && card != null;
          const hasCard = i < cards.length;

          if (!hasCard && i >= revealedCount) {
            // Empty placeholder slot
            return (
              <div
                key={i}
                className="w-16 h-[88px] rounded-xl border-2 border-dashed border-emerald-600/40 flex items-center justify-center"
              >
                <span className="text-emerald-600/30 text-2xl">?</span>
              </div>
            );
          }

          return <CardComponent key={i} card={card} revealed={isRevealed} index={i} />;
        })}
      </div>
    </div>
  );
};

export default CommunityCards;