import type { ReactNode } from 'react';

export interface PotDisplayProps {
  amount: number;
}

export function PotDisplay({ amount }: PotDisplayProps): ReactNode {
  return <div>Pot: {amount}</div>;
}
