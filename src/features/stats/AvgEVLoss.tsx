import type { ReactNode } from 'react';

export interface AvgEVLossProps {
  value: number;
}

export function AvgEVLoss({ value }: AvgEVLossProps): ReactNode {
  return <div>{value.toFixed(2)} BB</div>;
}
