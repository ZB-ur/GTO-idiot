/**
 * SessionList — displays past sessions for review browsing.
 * Each row shows session date, hand count, P/L, and GTO conformance.
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { SessionSummary } from '../../types/session';
import { sessionService } from '../../services/session-service';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface SessionListProps {
  onSelectSession: (sessionId: string) => void;
  className?: string;
}

export const SessionList: React.FC<SessionListProps> = ({
  onSelectSession,
  className = '',
}) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sessionService.listSessions({
        offset,
        limit,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setSessions(result.sessions);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPL = (bb: number): { text: string; color: string } => {
    if (bb > 0) return { text: `+${bb.toFixed(1)} BB`, color: 'text-green-400' };
    if (bb < 0) return { text: `${bb.toFixed(1)} BB`, color: 'text-red-400' };
    return { text: '0 BB', color: 'text-gray-400' };
  };

  const conformanceColor = (pct: number): string => {
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return <SkeletonLoader rows={5} className={className} />;
  }

  if (error) {
    return (
      <div className={`card p-4 text-center ${className}`}>
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={loadSessions} className="btn-secondary mt-2 text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No Sessions Yet"
        description="Play some hands first, then come back to review your play."
        className={className}
      />
    );
  }

  const hasMore = offset + limit < total;
  const hasPrev = offset > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <h2 className="text-lg font-semibold text-white mb-3">Sessions</h2>

      {sessions.map((s) => {
        const pl = formatPL(s.netProfitLossBB);
        return (
          <button
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className="w-full card p-3 flex items-center justify-between
              hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-white font-medium">
                {formatDate(s.startedAt)}
              </span>
              <span className="text-xs text-gray-400">
                {s.handCount} hand{s.handCount !== 1 ? 's' : ''}
                {s.status === 'active' && (
                  <span className="ml-1.5 text-yellow-400">(active)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className={pl.color}>{pl.text}</span>
              <span className={conformanceColor(s.gtoConformance)}>
                {s.gtoConformance.toFixed(0)}%
              </span>
            </div>
          </button>
        );
      })}

      {/* Pagination */}
      {(hasPrev || hasMore) && (
        <div className="flex justify-between pt-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={!hasPrev}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={!hasMore}
            className="btn-secondary text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionList;
