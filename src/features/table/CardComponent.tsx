import type { ReactNode } from 'react';
import type { Card } from '../../types';

export interface CardComponentProps {
  card?: Card | null;
  faceDown?: boolean;
}

export function CardComponent({ card, faceDown }: CardComponentProps): ReactNode {
  if (faceDown || !card) {
    return <div>Card Back</div>;
  }
  return <div>{card.rank}{card.suit}</div>;
}
