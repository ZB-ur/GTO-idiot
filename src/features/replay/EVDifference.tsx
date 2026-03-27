import type { ReactNode } from 'react';

export interface EVDifferenceProps {
  value: number | null;
}

export function EVDifference({ value }: EVDifferenceProps): ReactNode {
  if (value === null) return <span>N/A</span>;
  return <span>{value} BB</span>;
}
