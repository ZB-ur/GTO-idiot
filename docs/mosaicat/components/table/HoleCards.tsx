import React from 'react';
import { CardComponent } from '../shared/CardComponent';

interface Card {
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
  suit: 's' | 'h' | 'd' | 'c';
}

interface HoleCardsProps {
  cards?: [Card, Card];
  faceDown?: boolean;
  size?: 'sm' | 'md';
}

export const HoleCards: React.FC<HoleCardsProps> = ({
  cards,
  faceDown = false,
  size = 'md',
}) => {
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';
  const overlap = size === 'sm' ? '-ml-3' : '-ml-4';

  if (!cards && !faceDown) {
    return null;
  }

  return (
    <div className={`flex items-center`}>
      {faceDown || !cards ? (
        <>
          <CardComponent faceDown size={size} />
          <div className={overlap}>
            <CardComponent faceDown size={size} />
          </div>
        </>
      ) : (
        <>
          <CardComponent rank={cards[0].rank} suit={cards[0].suit} size={size} />
          <div className={overlap}>
            <CardComponent rank={cards[1].rank} suit={cards[1].suit} size={size} />
          </div>
        </>
      )}
    </div>
  );
};