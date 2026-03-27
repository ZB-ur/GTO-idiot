import { useState } from 'react';
import type { Statistics, PLDataPoint } from '../../../types';

export interface UseStatisticsReturn {
  statistics: Statistics | null;
  plChartData: PLDataPoint[];
  isLoading: boolean;
  error: string | null;
}

export function useStatistics(_sessionId?: string): UseStatisticsReturn {
  const [statistics] = useState<Statistics | null>(null);
  const [plChartData] = useState<PLDataPoint[]>([]);

  return {
    statistics,
    plChartData,
    isLoading: false,
    error: null,
  };
}
