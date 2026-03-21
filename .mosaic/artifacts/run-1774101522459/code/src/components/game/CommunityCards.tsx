// ============================================================
// CommunityCards — Flop/Turn/River display at table center
// ============================================================

import React from 'react';
import type { Card as CardType, HandPhase } from '../../types';
import Card from './Card';

export interface CommunityCardsProps {
  cards: CardType[];
  phase: HandPhase;
  animate?: boolean;
}

const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  phase,
  animate = true,
}) => {
  // Determine which cards to show based on phase
  const visibleCount =
    phase === 'preflop' ? 0 :
    phase === 'flop' ? 3 :
    phase === 'turn' ? 4 :
    5; // river, showdown, settled

  const visibleCards = cards.slice(0, visibleCount);

  if (visibleCards.length === 0) {
    return (
      <div className="flex gap-1.5 items-center justify-center h-[84px]">
        {/* Placeholder slots */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-14 h-20 rounded-lg border border-felt-light/30 bg-felt-dark/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 items-center justify-center">
      {visibleCards.map((card, i) => {
        // Flop cards animate together, turn/river animate individually
        const shouldAnimate = animate && (
          (phase === 'flop' && i < 3) ||
          (phase === 'turn' && i === 3) ||
          (phase === 'river' && i === 4)
        );

        return (
          <Card
            key={`${card.rank}${card.suit}`}
            card={card}
            faceUp
            size="md"
            animate={shouldAnimate}
            dealIndex={phase === 'flop' ? i : 0}
          />
        );
      })}
      {/* Empty slots for remaining cards */}
      {Array.from({ length: 5 - visibleCards.length }, (_, i) => (
        <div
          key={`empty-${i}`}
          className="w-14 h-20 rounded-lg border border-felt-light/30 bg-felt-dark/50"
        />
      ))}
    </div>
  );
};

export default React.memo(CommunityCards);
