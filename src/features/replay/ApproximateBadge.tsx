import type { ReactNode } from 'react';

export interface ApproximateBadgeProps {
  isApproximate: boolean;
}

export function ApproximateBadge({ isApproximate }: ApproximateBadgeProps): ReactNode {
  if (!isApproximate) return null;
  return <span>ApproximateBadge</span>;
}
