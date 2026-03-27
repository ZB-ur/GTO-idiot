import type { ReactNode } from 'react';
import type { PLDataPoint } from '../../types';

export interface PLChartProps {
  dataPoints: PLDataPoint[];
}

export function PLChart({ dataPoints }: PLChartProps): ReactNode {
  void dataPoints;
  return <div>PLChart</div>;
}
