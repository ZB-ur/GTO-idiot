import type { ReactNode } from 'react';
import type { Card } from '../../types';

export interface MiniCardPairProps {
  cards: [Card, Card];
}

export function MiniCardPair({ cards }: MiniCardPairProps): ReactNode {
  return (
    <span>
      {cards[0].rank}{cards[0].suit} {cards[1].rank}{cards[1].suit}
    </span>
  );
}
