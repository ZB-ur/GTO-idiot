import React, { useEffect, useState, useRef } from 'react';
import { CardComponent } from '../shared/CardComponent';

interface Card {
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
  suit: 's' | 'h' | 'd' | 'c';
}

interface CardFlipAnimationProps {
  card: Card;
  delay?: number;
  onComplete?: () => void;
}

const FLIP_DURATION_MS = 500;

export const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  card,
  delay = 0,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'waiting' | 'flipping' | 'done'>('waiting');
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setPhase('flipping');
    }, delay);
    timerRef.current.push(delayTimer);

    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, delay + FLIP_DURATION_MS);
    timerRef.current.push(doneTimer);

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [delay, onComplete]);

  return (
    <div
      className="inline-block"
      style={{
        perspective: '600px',
      }}
    >
      <div
        className="relative transition-transform ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transitionDuration: `${FLIP_DURATION_MS}ms`,
          transitionDelay: phase === 'waiting' ? `${delay}ms` : '0ms',
          transform:
            phase === 'waiting'
              ? 'rotateY(180deg)'
              : 'rotateY(0deg)',
        }}
      >
        {/* Front face — the actual card */}
        <div
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <CardComponent rank={card.rank} suit={card.suit} size="md" />
        </div>

        {/* Back face — card back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardComponent faceDown size="md" />
        </div>
      </div>
    </div>
  );
};