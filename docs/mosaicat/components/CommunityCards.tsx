import React from 'react';
import { MiniCard } from './MiniCard';

interface CardData {
  rank: string;
  suit: string;
}

interface CommunityCardsProps {
  cards: CardData[];
  className?: string;
}

const TOTAL_SLOTS = 5;

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  className = '',
}) => {
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => cards[i] ?? null);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {slots.map((card, i) => {
        // Dealt card
        if (card) {
          return (
            <MiniCard
              key={i}
              card={card}
              size="lg"
              className="transition-all duration-300 ease-out"
            />
          );
        }

        // Empty placeholder slot
        return (
          <div
            key={i}
            className="w-14 h-20 rounded-lg border border-dashed border-emerald-700/50 bg-emerald-900/30"
          />
        );
      })}
    </div>
  );
};

export default CommunityCards;