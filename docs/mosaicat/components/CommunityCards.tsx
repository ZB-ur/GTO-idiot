import React from 'react';
import { PlayingCard } from './PlayingCard';

interface CardData {
  rank: string;
  suit: string;
}

interface CommunityCardsProps {
  cards: CardData[];
  revealingStreet?: 'flop' | 'turn' | 'river';
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  revealingStreet,
}) => {
  const getRevealIndex = (): number => {
    switch (revealingStreet) {
      case 'flop': return 0;
      case 'turn': return 3;
      case 'river': return 4;
      default: return -1;
    }
  };

  const revealStart = getRevealIndex();
  const placeholders = 5 - cards.length;

  return (
    <div className="flex items-center justify-center gap-2">
      {cards.map((card, i) => {
        const isRevealing =
          revealingStreet &&
          ((revealingStreet === 'flop' && i < 3 && i >= revealStart) ||
            (revealingStreet === 'turn' && i === 3) ||
            (revealingStreet === 'river' && i === 4));

        return (
          <div
            key={i}
            className={`transition-all duration-500 ${
              isRevealing ? 'animate-flip' : ''
            }`}
          >
            <PlayingCard rank={card.rank} suit={card.suit} size="md" />
          </div>
        );
      })}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-14 h-20 rounded-lg border-2 border-dashed border-emerald-600/30"
        />
      ))}
    </div>
  );
};