import type { ReactNode } from 'react';
import { HandListFilterBar } from './HandListFilterBar';
import { HandListItem } from './HandListItem';
import type { HandListItem as HandListItemType } from '../../types';

export function HandListPage(): ReactNode {
  const hands: HandListItemType[] = [];
  return (
    <div>
      <HandListFilterBar />
      {hands.map((h) => (
        <HandListItem key={h.handId} hand={h} />
      ))}
    </div>
  );
}
