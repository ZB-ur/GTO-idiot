import type { ReactNode } from 'react';
import type { GTORatingSummary as GTORatingSummaryType } from '../../types';

export interface GTORatingSummaryProps {
  rating: GTORatingSummaryType;
}

export function GTORatingSummary({ rating }: GTORatingSummaryProps): ReactNode {
  return (
    <span>
      {rating.optimalCount}/{rating.totalDecisions}
    </span>
  );
}
