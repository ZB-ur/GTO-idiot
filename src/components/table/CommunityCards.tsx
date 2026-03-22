/**
 * CommunityCards — renders the 0–5 community cards at the center of the table.
 */

import React from 'react';
import type { Card } from '../../types';
import { CardComponent } from './CardComponent';

interface CommunityCardsProps {
  cards: Card[];
  className?: string;
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, className = '' }) => {
  // Always show 5 card slots; unrevealed ones are empty placeholders
  const slots = 5;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: slots }).map((_, i) => {
        if (i < cards.length) {
          return (
            <CardComponent
              key={i}
              card={cards[i]}
              size="md"
              animationDelay={i * 100}
            />
          );
        }
        // Empty placeholder slot
        return (
          <div
            key={i}
            className="w-11 h-16 rounded-md border border-dashed border-gray-600/40
              bg-black/10"
          />
        );
      })}
    </div>
  );
};

export default CommunityCards;
