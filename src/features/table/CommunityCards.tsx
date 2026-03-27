import type { ReactNode } from 'react';
import type { Card } from '../../types';
import { CardComponent } from './CardComponent';

export interface CommunityCardsProps {
  cards: Card[];
}

export function CommunityCards({ cards }: CommunityCardsProps): ReactNode {
  return (
    <div>
      {cards.map((card, i) => (
        <CardComponent key={i} card={card} />
      ))}
    </div>
  );
}
