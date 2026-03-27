import type { ReactNode } from 'react';

export interface StatSummaryCardProps {
  label: string;
  value: string;
}

export function StatSummaryCard({ label, value }: StatSummaryCardProps): ReactNode {
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
