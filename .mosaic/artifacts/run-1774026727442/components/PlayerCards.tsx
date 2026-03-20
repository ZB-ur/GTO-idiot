import React from 'react';
import { PlayingCard, Rank, Suit } from './PlayingCard';

export interface PlayerCardsProps {
  /** Array of cards to display (rank + suit). Undefined/empty = no cards dealt. */
  cards?: Array<{ rank: Rank; suit: Suit }>;
  /** If true, all cards render face-down (opponent hidden hand). */
  faceDown?: boolean;
  /** If true, cards are revealed with a subtle highlight (showdown state). */
  revealed?: boolean;
  /** Card size variant. */
  size?: 'sm' | 'md';
}

/**
 * PlayerCards — 手牌显示组件
 *
 * Three visual states:
 * 1. Own hand (cards provided, faceDown=false): face-up cards
 * 2. Opponent hand (faceDown=true): two face-down cards
 * 3. Showdown (revealed=true, cards provided): face-up with glow highlight
 */
export const PlayerCards: React.FC<PlayerCardsProps> = ({
  cards,
  faceDown = false,
  revealed = false,
  size = 'md',
}) => {
  // Default to 2 placeholder slots when no cards
  const cardCount = cards?.length ?? 2;
  const gap = size === 'sm' ? '-space-x-2' : '-space-x-3';

  return (
    <div
      className={`inline-flex ${gap} ${
        revealed ? 'relative' : ''
      }`}
    >
      {/* Showdown glow ring */}
      {revealed && (
        <div className="absolute -inset-1 rounded-lg bg-amber-400/20 blur-sm pointer-events-none" />
      )}

      {Array.from({ length: cardCount }).map((_, i) => {
        const card = cards?.[i];
        const showFaceDown = faceDown || !card;

        return (
          <div
            key={i}
            className={`relative ${
              revealed ? 'ring-1 ring-amber-400/60 rounded-md' : ''
            }`}
          >
            <PlayingCard
              card={card}
              faceDown={showFaceDown}
              size={size}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlayerCards;
