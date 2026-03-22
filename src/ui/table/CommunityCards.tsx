import React from 'react';
import type { Card } from '../../types';
import PlayingCard from '../components/PlayingCard';

export interface CommunityCardsProps {
  cards: Card[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards }) => {
  const slots = 5;
  const emptySlots = Math.max(0, slots - cards.length);

  return (
    <div className="flex items-center justify-center gap-2" aria-label="Community cards">
      {cards.map((card, i) => (
        <div
          key={`${card.rank}${card.suit}`}
          className="transform transition-all duration-300 ease-out"
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        >
          <PlayingCard card={card} size="md" />
        </div>
      ))}
      {/* Empty card slots */}
      {Array.from({ length: emptySlots }, (_, i) => (
        <div
          key={`empty-${i}`}
          className="w-14 h-20 rounded-lg border-2 border-dashed border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
};

export default CommunityCards;
