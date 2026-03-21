// ============================================================
// HandHistoryList — Infinite-scroll hand history with filters
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { HandHistorySummary, Position, Street } from '../../types';
import { listHandHistory } from '../../services/history-service';
import HandHistoryItem from './HandHistoryItem';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';

interface HandHistoryListProps {
  onSelectHand: (handId: string) => void;
  sessionId?: string;
}

const POSITIONS: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];
const PAGE_SIZE = 20;

const HandHistoryList: React.FC<HandHistoryListProps> = ({ onSelectHand, sessionId }) => {
  const [hands, setHands] = useState<HandHistorySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [positionFilter, setPositionFilter] = useState<Position | ''>('');
  const [streetFilter, setStreetFilter] = useState<Street | ''>('');

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = cursor !== null;

  // Fetch initial or filtered data
  const fetchHands = useCallback(async (resetList = true) => {
    try {
      if (resetList) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const result = await listHandHistory({
        cursor: resetList ? undefined : (cursor ?? undefined),
        limit: PAGE_SIZE,
        sessionId,
        position: positionFilter || undefined,
        street: streetFilter || undefined,
      });

      if (resetList) {
        setHands(result.hands);
      } else {
        setHands((prev) => [...prev, ...result.hands]);
      }
      setTotal(result.total);
      setCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hand history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, sessionId, positionFilter, streetFilter]);

  // Initial load + filter changes
  useEffect(() => {
    setCursor(null);
    fetchHands(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, positionFilter, streetFilter]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchHands(false);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchHands]);

  return (
    <div className="flex flex-col h-full">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Hand History</h2>
          <p className="text-sm text-gray-400">
            {total > 0 ? `${total} hand${total !== 1 ? 's' : ''} recorded` : 'No hands yet'}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value as Position | '')}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Positions</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={streetFilter}
            onChange={(e) => setStreetFilter(e.target.value as Street | '')}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Streets</option>
            {STREETS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="h-14" variant="rect" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && hands.length === 0 && !error && (
        <EmptyState
          icon="📜"
          title="No Hands Found"
          description={
            positionFilter || streetFilter
              ? 'Try adjusting your filters.'
              : 'Play some hands to see your history here.'
          }
        />
      )}

      {/* Hand list */}
      {!loading && hands.length > 0 && (
        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          {hands.map((hand) => (
            <HandHistoryItem
              key={hand.id}
              hand={hand}
              onSelect={onSelectHand}
            />
          ))}

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandHistoryList;
