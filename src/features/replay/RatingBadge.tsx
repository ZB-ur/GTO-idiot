import type { ReactNode } from 'react';
import type { GTORating } from '../../types';

export interface RatingBadgeProps {
  rating: GTORating;
}

export function RatingBadge({ rating }: RatingBadgeProps): ReactNode {
  return <span>{rating}</span>;
}
