/**
 * StatsDashboard — main statistics page.
 *
 * Composes SummaryCards, ConformanceTrendChart, PositionBreakdownChart,
 * StreetBreakdownChart, DeviationRankingList, and DateRangeFilter.
 *
 * Fetches data from the persistence layer via session/hand repositories
 * and computes stats client-side.
 */

import React, { useCallback, useEffect, useState } from 'react';

import type {
  StatsSummary,
  ConformanceTrend,
  PositionBreakdown,
  StreetBreakdown,
  TopDeviations,
  StatsQueryParams,
  DeviationEntry,
} from '../../types/stats';
import type { SessionSummary } from '../../types/session';

import { DateRangeFilter, type DateRange } from './DateRangeFilter';
import { SummaryCards } from './SummaryCards';
import { ConformanceTrendChart } from './ConformanceTrendChart';
import { PositionBreakdownChart } from './PositionBreakdownChart';
import { StreetBreakdownChart } from './StreetBreakdownChart';
import { DeviationRankingList } from './DeviationRankingList';

import { sessionRepository } from '../../persistence/session-repository';
import { handRepository } from '../../persistence/hand-repository';

// ─── Internal Stats Computation ─────────────────────────────────

async function fetchAllSessions(): Promise<SessionSummary[]> {
  const result = await sessionRepository.list();
  return result.sessions;
}

async function computeStatsSummary(params: StatsQueryParams): Promise<StatsSummary> {
  const sessions = await fetchAllSessions();
  const filtered = filterByDate(sessions, params);

  let totalHands = 0;
  let totalConformanceSum = 0;
  let totalConformanceCount = 0;
  let netPL = 0;

  for (const session of filtered) {
    totalHands += session.handCount ?? 0;
    netPL += session.netProfitLossBB ?? 0;
    if (session.gtoConformance != null) {
      totalConformanceSum += session.gtoConformance;
      totalConformanceCount++;
    }
  }

  return {
    totalHands,
    totalSessions: filtered.length,
    netProfitLossBB: netPL,
    overallGTOConformance:
      totalConformanceCount > 0 ? totalConformanceSum / totalConformanceCount : 0,
  };
}

async function computeConformanceTrend(params: StatsQueryParams): Promise<ConformanceTrend> {
  const sessions = await fetchAllSessions();
  const filtered = filterByDate(sessions, params);

  const dataPoints = filtered
    .filter((s) => s.gtoConformance != null)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .map((s) => ({
      sessionId: s.id,
      date: s.startedAt,
      conformance: s.gtoConformance ?? 0,
      handsPlayed: s.handCount ?? 0,
      netProfitLossBB: s.netProfitLossBB,
    }));

  return { dataPoints };
}

async function computePositionBreakdown(params: StatsQueryParams): Promise<PositionBreakdown> {
  const sessions = await fetchAllSessions();
  const filtered = filterByDate(sessions, params);
  const sessionIds = new Set(filtered.map((s) => s.id));

  const posMap = new Map<string, { conformanceSum: number; count: number; hands: number; pl: number }>();

  for (const sid of sessionIds) {
    const hands = await handRepository.getAllBySession(sid);
    for (const hand of hands) {
      const humanPlayer = hand.players.find((p) => !p.isBot);
      const pos = humanPlayer?.position;
      if (!pos) continue;

      const entry = posMap.get(pos) ?? { conformanceSum: 0, count: 0, hands: 0, pl: 0 };
      entry.hands++;
      entry.pl += hand.result?.humanNetResult ?? 0;
      // Use a simple heuristic: average 50 (unknown) since HandHistory doesn't carry gtoConformance
      entry.conformanceSum += 50;
      entry.count++;
      posMap.set(pos, entry);
    }
  }

  const positions = Array.from(posMap.entries()).map(([position, e]) => ({
    position: position as any,
    conformance: e.count > 0 ? e.conformanceSum / e.count : 0,
    handsPlayed: e.hands,
    netProfitLossBB: e.pl,
  }));

  return { positions };
}

async function computeStreetBreakdown(params: StatsQueryParams): Promise<StreetBreakdown> {
  const sessions = await fetchAllSessions();
  const filtered = filterByDate(sessions, params);
  const sessionIds = new Set(filtered.map((s) => s.id));

  const streetMap = new Map<string, { conformanceSum: number; count: number }>();

  for (const sid of sessionIds) {
    const hands = await handRepository.getAllBySession(sid);
    for (const hand of hands) {
      if (!hand.streets) continue;
      const humanPlayer = hand.players.find((p) => !p.isBot);
      if (!humanPlayer) continue;
      for (const street of hand.streets) {
        if (!street.actions) continue;
        for (const action of street.actions) {
          if (action.playerId !== humanPlayer.playerId) continue;
          const entry = streetMap.get(street.street) ?? { conformanceSum: 0, count: 0 };
          entry.count++;
          entry.conformanceSum += 50; // default score, no GTO data on ActionRecord
          streetMap.set(street.street, entry);
        }
      }
    }
  }

  const streets = Array.from(streetMap.entries()).map(([street, e]) => ({
    street: street as any,
    conformance: e.count > 0 ? e.conformanceSum / e.count : 0,
    decisionCount: e.count,
  }));

  return { streets };
}

async function computeTopDeviations(params: StatsQueryParams): Promise<TopDeviations> {
  const sessions = await fetchAllSessions();
  const filtered = filterByDate(sessions, params);
  const sessionIds = new Set(filtered.map((s) => s.id));

  // Deviation tracking requires GTO comparison data which is not stored on ActionRecord.
  // We return an empty list; a future enhancement can add GTO comparison to ActionRecord.
  const deviations: DeviationEntry[] = [];

  // Placeholder: iterate hands to find any deviation info from session-level data
  void sessionIds;

  return { deviations };
}

// ─── Helpers ─────────────────────────────────────────────────────

function filterByDate(items: SessionSummary[], params: StatsQueryParams): SessionSummary[] {
  return items.filter((item) => {
    if (!item.startedAt) return true;
    const d = new Date(item.startedAt).getTime();
    if (params.dateFrom && d < new Date(params.dateFrom).getTime()) return false;
    if (params.dateTo && d > new Date(params.dateTo + 'T23:59:59').getTime()) return false;
    if (params.sessionIds?.length && !params.sessionIds.includes(item.id)) return false;
    return true;
  });
}

// ─── Hook ────────────────────────────────────────────────────────

interface StatsData {
  summary: StatsSummary | null;
  trend: ConformanceTrend | null;
  positions: PositionBreakdown | null;
  streets: StreetBreakdown | null;
  deviations: TopDeviations | null;
  loading: boolean;
  error: string | null;
}

function useStatsData(params: StatsQueryParams): StatsData {
  const [state, setState] = useState<StatsData>({
    summary: null,
    trend: null,
    positions: null,
    streets: null,
    deviations: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([
      computeStatsSummary(params),
      computeConformanceTrend(params),
      computePositionBreakdown(params),
      computeStreetBreakdown(params),
      computeTopDeviations(params),
    ])
      .then(([summary, trend, positions, streets, deviations]) => {
        if (cancelled) return;
        setState({ summary, trend, positions, streets, deviations, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load stats',
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [params.dateFrom, params.dateTo, params.sessionIds?.join(',')]);

  return state;
}

// ─── Dashboard Component ─────────────────────────────────────────

export const StatsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({});

  const params: StatsQueryParams = React.useMemo(
    () => ({
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    }),
    [dateRange.dateFrom, dateRange.dateTo],
  );

  const { summary, trend, positions, streets, deviations, loading, error } = useStatsData(params);

  const handleDateChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Statistics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your GTO conformance and identify leaks</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={handleDateChange} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards data={summary} loading={loading} />

      {/* Trend Chart (full width) */}
      <ConformanceTrendChart data={trend} loading={loading} />

      {/* Two-column breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PositionBreakdownChart data={positions} loading={loading} />
        <StreetBreakdownChart data={streets} loading={loading} />
      </div>

      {/* Deviation Ranking */}
      <DeviationRankingList data={deviations} loading={loading} />
    </div>
  );
};
