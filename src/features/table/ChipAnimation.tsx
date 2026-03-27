import type { ReactNode } from 'react';

export interface ChipAnimationProps {
  isActive: boolean;
}

export function ChipAnimation({ isActive }: ChipAnimationProps): ReactNode {
  if (!isActive) return null;
  return <div>ChipAnimation</div>;
}
