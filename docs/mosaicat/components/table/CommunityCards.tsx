import React from 'react';
import { CardComponent } from '../shared/CardComponent';

interface Card {
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
  suit: 's' | 'h' | 'd' | 'c';
}

interface CommunityCardsProps {
  cards: Card[];
  maxCards?: number;
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  maxCards = 5,
}) => {
  const displayCards = cards.slice(0, maxCards);
  const emptySlots = Math.max(0, 5 - displayCards.length);

  return (
    <div className="flex items-center gap-2">
      {/* Flop (first 3) */}
      {displayCards.slice(0, 3).map((card, i) => (
        <CardComponent key={`flop-${i}`} rank={card.rank} suit={card.suit} size="md" />
      ))}

      {/* Gap between flop and turn */}
      {displayCards.length > 3 && <div className="w-1" />}

      {/* Turn (4th card) */}
      {displayCards.length > 3 && (
        <CardComponent rank={displayCards[3].rank} suit={displayCards[3].suit} size="md" />
      )}

      {/* Gap between turn and river */}
      {displayCards.length > 4 && <div className="w-1" />}

      {/* River (5th card) */}
      {displayCards.length > 4 && (
        <CardComponent rank={displayCards[4].rank} suit={displayCards[4].suit} size="md" />
      )}

      {/* Empty placeholders */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className={`w-16 h-22 rounded-lg border-2 border-dashed border-emerald-700/50 bg-emerald-900/30 ${
            i === 0 && displayCards.length === 3 ? 'ml-1' : ''
          } ${i === 0 && displayCards.length === 4 ? 'ml-1' : ''}`}
        />
      ))}
    </div>
  );
};