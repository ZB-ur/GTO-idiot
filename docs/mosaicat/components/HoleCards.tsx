import React from 'react';
import { MiniCard } from './MiniCard';

interface CardData {
  rank: string;
  suit: string;
}

interface HoleCardsProps {
  cards?: CardData[];
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OVERLAP_CLASSES: Record<string, string> = {
  sm: '-ml-3',
  md: '-ml-4',
  lg: '-ml-5',
};

export const HoleCards: React.FC<HoleCardsProps> = ({
  cards,
  faceDown = false,
  size = 'md',
  className = '',
}) => {
  const overlapClass = OVERLAP_CLASSES[size];

  // Face-down: show two card backs
  if (faceDown || !cards || cards.length < 2) {
    return (
      <div className={`flex items-center ${className}`}>
        <MiniCard card={{ rank: '', suit: '' }} size={size} faceDown />
        <MiniCard card={{ rank: '', suit: '' }} size={size} faceDown className={overlapClass} />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <MiniCard card={cards[0]} size={size} />
      <MiniCard card={cards[1]} size={size} className={overlapClass} />
    </div>
  );
};

export default HoleCards;