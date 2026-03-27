import type { Card, HandCategory } from '../types';

export function categorizeHand(
  _holeCards: [Card, Card],
  _communityCards: Card[],
): HandCategory {
  return 'medium_made';
}
