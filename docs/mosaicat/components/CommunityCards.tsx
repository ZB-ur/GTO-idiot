import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface CommunityCardsProps {
  cards: Card[];
}

const SUIT_SYMBOLS: Record<string, { char: string; color: string }> = {
  hearts: { char: '\u2665', color: 'text-red-500' },
  diamonds: { char: '\u2666', color: 'text-red-500' },
  clubs: { char: '\u2663', color: 'text-gray-900' },
  spades: { char: '\u2660', color: 'text-gray-900' },
};

const CommunityCard: React.FC<{ card: Card; index: number }> = ({ card, index }) => {
  const suitInfo = SUIT_SYMBOLS[card.suit] ?? { char: '?', color: 'text-gray-500' };

  return (
    <div
      className="w-16 h-[5.5rem] flex flex-col items-center justify-center rounded-lg bg-gray-100 shadow-lg border border-gray-200 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className={`text-xl font-bold ${suitInfo.color} leading-none`}>
        {card.rank}
      </span>
      <span className={`text-base ${suitInfo.color} leading-none mt-0.5`}>
        {suitInfo.char}
      </span>
    </div>
  );
};

const EmptySlot: React.FC = () => (
  <div className="w-16 h-[5.5rem] rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/30" />
);

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] ?? null);

  return (
    <div className="flex items-center gap-2">
      {slots.map((card, i) =>
        card ? (
          <CommunityCard key={i} card={card} index={i} />
        ) : (
          <EmptySlot key={i} />
        ),
      )}
    </div>
  );
};

export default CommunityCards;