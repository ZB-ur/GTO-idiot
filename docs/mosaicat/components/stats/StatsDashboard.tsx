import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SummaryCards } from './SummaryCards';
import { DateRangeFilter } from './DateRangeFilter';
import { SessionFilter } from './SessionFilter';
import { ConformanceTrendChart } from './ConformanceTrendChart';
import { PositionBreakdownChart } from './PositionBreakdownChart';
import { StreetBreakdownChart } from './StreetBreakdownChart';
import { DeviationRankingList } from './DeviationRankingList';

// Types from API spec
interface DateRange {
  dateFrom?: string; // ISO date
  dateTo?: string;
}

interface SessionOption {
  id: string;
  label: string;
  date: string;
}

interface StatsSummary {
  totalHands: number;
  totalSessions: number;
  netProfitLossBB: number;
  overallGTOConformance: number;
}

interface ConformanceTrendPoint {
  sessionId: string;
  date: string;
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

interface PositionStat {
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  conformance: number;
  handsPlayed: number;
  netProfitLossBB?: number;
}

interface StreetStat {
  street: 'preflop' | 'flop' | 'turn' | 'river';
  conformance: number;
  decisionCount: number;
}

interface Deviation {
  type: string;
  description: string;
  count: number;
  averageEvLoss: number;
  street?: 'preflop' | 'flop' | 'turn' | 'river';
  examples?: { handId: string; sessionId: string }[];
}

// Service layer imports (conceptual — backed by IndexedDB)
import { StatsService } from '../../services/StatsService';
import { SessionService } from '../../services/SessionService';

export const StatsDashboard: React.FC = () => {
  // Filter state
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  // Data state
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [trendData, setTrendData] = useState<ConformanceTrendPoint[]>([]);
  const [positionData, setPositionData] = useState<PositionStat[]>([]);
  const [streetData, setStreetData] = useState<StreetStat[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [sessionOptions, setSessionOptions] = useState<SessionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Build query params from filters
  const queryParams = useMemo(() => ({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    sessionIds: selectedSessionIds.length > 0 ? selectedSessionIds : undefined,
  }), [dateRange, selectedSessionIds]);

  // Load session options for filter dropdown
  useEffect(() => {
    const loadSessions = async () => {
      const { sessions } = await SessionService.listSessions({
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 100,
      });
      setSessionOptions(
        sessions.map((s) => ({
          id: s.id,
          label: `Session ${s.id.slice(0, 8)}`,
          date: s.startedAt,
        }))
      );
    };
    loadSessions();
  }, []);

  // Load all stats data when filters change
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, trendRes, positionRes, streetRes, deviationRes] =
        await Promise.all([
          StatsService.getSummary(queryParams),
          StatsService.getConformanceTrend(queryParams),
          StatsService.getPositionBreakdown(queryParams),
          StatsService.getStreetBreakdown(queryParams),
          StatsService.getTopDeviations({ ...queryParams, limit: 10 }),
        ]);

      setSummary(summaryRes);
      setTrendData(trendRes.dataPoints);
      setPositionData(positionRes.positions);
      setStreetData(streetRes.streets);
      setDeviations(deviationRes.deviations);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const handleSessionFilterChange = useCallback((ids: string[]) => {
    setSelectedSessionIds(ids);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">统计数据</h1>
          <p className="mt-1 text-sm text-gray-600">
            追踪你的 GTO 一致性和盈利趋势
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <DateRangeFilter
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <SessionFilter
            options={sessionOptions}
            selected={selectedSessionIds}
            onChange={handleSessionFilterChange}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">加载统计数据...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            {summary && <SummaryCards data={summary} />}

            {/* Conformance Trend — full width */}
            <ConformanceTrendChart data={trendData} />

            {/* Two-column charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PositionBreakdownChart data={positionData} />
              <StreetBreakdownChart data={streetData} />
            </div>

            {/* Deviation Ranking — full width */}
            <DeviationRankingList data={deviations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;