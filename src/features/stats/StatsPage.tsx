import type { ReactNode } from 'react';
import { StatSummaryCard } from './StatSummaryCard';
import { PLChart } from './PLChart';
import { GTOComplianceRate } from './GTOComplianceRate';
import { AvgEVLoss } from './AvgEVLoss';

export function StatsPage(): ReactNode {
  return (
    <div>
      <StatSummaryCard label="Total Hands" value="0" />
      <StatSummaryCard label="Net Profit" value="0 BB" />
      <PLChart dataPoints={[]} />
      <GTOComplianceRate rate={0} />
      <AvgEVLoss value={0} />
    </div>
  );
}
