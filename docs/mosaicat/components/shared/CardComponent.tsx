import React, { useState, useCallback } from 'react';
import { Card } from './Card';

export interface CardComponentProps {
  rank: string;
  suit: string;
  faceUp: boolean;
  onFlip?: () => void;
  animateReveal?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  rank,
  suit,
  faceUp,
  onFlip,
  animateReveal = false,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFace, setShowFace] = useState(faceUp);

  const handleFlip = useCallback(() => {
    if (!onFlip) return;

    if (animateReveal) {
      setIsFlipping(true);
      setTimeout(() => {
        setShowFace(!showFace);
        setTimeout(() => {
          setIsFlipping(false);
          onFlip();
        }, 300);
      }, 300);
    } else {
      setShowFace(!showFace);
      onFlip();
    }
  }, [onFlip, animateReveal, showFace]);

  // Sync with prop changes
  React.useEffect(() => {
    if (!animateReveal) {
      setShowFace(faceUp);
      return;
    }
    if (faceUp !== showFace) {
      setIsFlipping(true);
      setTimeout(() => {
        setShowFace(faceUp);
        setTimeout(() => setIsFlipping(false), 300);
      }, 300);
    }
  }, [faceUp, animateReveal]);

  return (
    <div
      className={`cursor-pointer transition-transform duration-300 ${
        isFlipping ? 'scale-x-0' : 'scale-x-100'
      }`}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-label={showFace ? `${rank} of ${suit}` : 'Face-down card'}
      onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
    >
      <Card
        rank={rank}
        suit={suit as 'hearts' | 'diamonds' | 'clubs' | 'spades'}
        faceUp={showFace}
        size="md"
      />
    </div>
  );
};

export default CardComponent;