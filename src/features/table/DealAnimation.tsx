import type { ReactNode } from 'react';

export interface DealAnimationProps {
  isActive: boolean;
}

export function DealAnimation({ isActive }: DealAnimationProps): ReactNode {
  if (!isActive) return null;
  return <div>DealAnimation</div>;
}
