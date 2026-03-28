import { useState, useEffect } from 'react';
import type { SessionStats, Position } from '../types';
import { PageContainer } from './PageContainer';
import { StatCard } from './StatCard';
import { StatCardSkeleton } from './StatCardSkeleton';
import { PositionBreakdownTable } from './PositionBreakdownTable';
import { GtoConformanceChart } from './GtoConformanceChart';
import { PositionFilterChip } from './PositionFilterChip';
import { StatsEmptyState } from './StatsEmptyState';

const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

export function StatsPage() {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState<Position | null>(null);

  useEffect(() => {
    fetchStats(filterPosition);
  }, [filterPosition]);

  async function fetchStats(position: Position | null) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (position) params.set('filter_position', position);
      const res = await fetch(`/api/stats?${params}`);
      if (!res.ok) throw new Error('Failed to load stats');
      const data: SessionStats = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleFilterToggle(pos: Position) {
    setFilterPosition((prev) => (prev === pos ? null : pos));
  }

  if (!loading && !error && stats && stats.totalHands === 0) {
    return (
      <PageContainer>
        <StatsEmptyState />
      </PageContainer>
    );
  }

  const pnlColor =
    stats && stats.totalPnl > 0
      ? 'text-emerald-500'
      : stats && stats.totalPnl < 0
        ? 'text-red-500'
        : 'text-gray-50';

  const bbColor =
    stats && stats.bbPer100 > 0
      ? 'text-emerald-500'
      : stats && stats.bbPer100 < 0
        ? 'text-red-500'
        : 'text-gray-50';

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-50">Stats</h1>
        </div>

        {/* Position Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <PositionFilterChip
              key={pos}
              position={pos}
              active={filterPosition === pos}
              onClick={() => handleFilterToggle(pos)}
            />
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : error ? (
            <div className="col-span-full rounded-xl bg-gray-900 border border-gray-700 p-6 text-center text-red-500">
              {error}
            </div>
          ) : stats ? (
            <>
              <StatCard
                label="Hands Played"
                value={stats.totalHands.toLocaleString()}
              />
              <StatCard
                label="Total P/L"
                value={`${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(1)} BB`}
                valueClass={pnlColor}
              />
              <StatCard
                label="bb/100"
                value={`${stats.bbPer100 >= 0 ? '+' : ''}${stats.bbPer100.toFixed(1)}`}
                valueClass={bbColor}
              />
              <StatCard
                label="GTO Conformance"
                value={
                  stats.gtoConformance === -1
                    ? '—'
                    : `${stats.gtoConformance.toFixed(1)}%`
                }
                valueClass="text-amber-400"
              />
            </>
          ) : null}
        </div>

        {/* GTO Conformance Chart */}
        {!loading && stats && stats.gtoConformance !== -1 && (
          <div className="rounded-xl bg-gray-900 border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-50 mb-4">
              GTO Conformance by Position
            </h2>
            <GtoConformanceChart positionStats={stats.positionStats} />
          </div>
        )}

        {/* Position Breakdown Table */}
        {!loading && stats && (
          <div className="rounded-xl bg-gray-900 border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-50 mb-4">
              Position Breakdown
            </h2>
            <PositionBreakdownTable positionStats={stats.positionStats} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}