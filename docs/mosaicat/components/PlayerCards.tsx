import React from 'react';
import { PlayingCard } from './PlayingCard';

interface CardData {
  rank: string;
  suit: string;
}

interface PlayerCardsProps {
  cards?: CardData[];
  faceDown?: boolean;
  folded?: boolean;
  dealing?: boolean;
}

export const PlayerCards: React.FC<PlayerCardsProps> = ({
  cards,
  faceDown = false,
  folded = false,
  dealing = false,
}) => {
  const containerClasses = [
    'flex gap-1',
    folded ? 'opacity-40 grayscale' : '',
    dealing ? 'animate-deal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!cards || cards.length === 0 || faceDown) {
    return (
      <div className={containerClasses}>
        <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-900 shadow-sm" />
        <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-900 shadow-sm -ml-2 rotate-3" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {cards.map((card, i) => (
        <div key={i} className={i === 1 ? '-ml-2 rotate-3' : ''}>
          <PlayingCard rank={card.rank} suit={card.suit} size="sm" />
        </div>
      ))}
    </div>
  );
};