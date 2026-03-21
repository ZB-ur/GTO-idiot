import React from 'react';
import PlayingCard, { Rank, Suit } from './PlayingCard';

interface CommunityCardsProps {
  cards: Array<{ rank: Rank; suit: Suit }>;
  animate?: boolean;
  className?: string;
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  animate = false,
  className = '',
}) => {
  const emptySlots = 5 - cards.length;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {cards.map((card, i) => (
        <div
          key={i}
          className={animate ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}
          style={animate ? { animationDelay: `${i * 100}ms` } : undefined}
        >
          <PlayingCard rank={card.rank} suit={card.suit} size="md" animated={animate} />
        </div>
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-16 h-22 rounded-lg border-2 border-dashed border-emerald-600/30 bg-emerald-900/20"
        />
      ))}
    </div>
  );
};

export default CommunityCards;