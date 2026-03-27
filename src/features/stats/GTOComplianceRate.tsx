import type { ReactNode } from 'react';

export interface GTOComplianceRateProps {
  rate: number;
}

export function GTOComplianceRate({ rate }: GTOComplianceRateProps): ReactNode {
  return <div>{(rate * 100).toFixed(1)}%</div>;
}
