import type { ReactNode } from 'react';
import type { HandListItem as HandListItemType } from '../../types';
import { MiniCardPair } from './MiniCardPair';
import { ResultBadge } from './ResultBadge';
import { GTORatingSummary } from './GTORatingSummary';

export interface HandListItemProps {
  hand: HandListItemType;
}

export function HandListItem({ hand }: HandListItemProps): ReactNode {
  return (
    <div>
      <MiniCardPair cards={hand.holeCards} />
      <ResultBadge resultBB={hand.resultBB} />
      <GTORatingSummary rating={hand.gtoRating} />
    </div>
  );
}
