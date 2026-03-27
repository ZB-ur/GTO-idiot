import type { ReactNode } from 'react';

export interface ResultBadgeProps {
  resultBB: number;
}

export function ResultBadge({ resultBB }: ResultBadgeProps): ReactNode {
  return <span>{resultBB > 0 ? '+' : ''}{resultBB} BB</span>;
}
