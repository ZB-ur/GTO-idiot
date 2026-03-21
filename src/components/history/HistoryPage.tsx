// ============================================================
// GTO Idiot — History Page
// Top-level page for hand history browsing + replay
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { HandSummary, HandSortOrder } from '../../types';
import { listHands, type ListHandsOptions } from '../../storage/hand-repository';
import { useUIStore } from '../../stores/ui-store';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import HandList, { type HandListFilters } from './HandList';
import ReplayViewer from '../replay/ReplayViewer';

const PAGE_SIZE = 50;

export default function HistoryPage() {
  // ---------- State ----------
  const [hands, setHands] = useState<HandSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);
  const [filters, setFilters] = useState<HandListFilters>({
    sort: 'newest',
  });

  const addToast = useUIStore((s) => s.addToast);
  const offsetRef = useRef(0);

  // ---------- Data fetching ----------
  const fetchHands = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      try {
        const offset = reset ? 0 : offsetRef.current;
        const opts: ListHandsOptions = {
          limit: PAGE_SIZE,
          offset,
          sort: filters.sort as HandSortOrder,
          position: filters.position,
          result: filters.result,
        };

        const response = await listHands(opts);

        if (reset) {
          setHands(response.hands);
          offsetRef.current = PAGE_SIZE;
        } else {
          setHands((prev) => [...prev, ...response.hands]);
          offsetRef.current = offset + PAGE_SIZE;
        }

        setTotal(response.total);
        setHasMore(response.has_more);
      } catch (err) {
        console.error('[HistoryPage] Failed to load hands:', err);
        addToast({
          type: 'error',
          message: 'Failed to load hand history.',
        });
      } finally {
        setLoading(false);
      }
    },
    [filters, addToast],
  );

  // Initial load + reload when filters change
  useEffect(() => {
    fetchHands(true);
  }, [fetchHands]);

  const handleLoadMore = useCallback(() => {
    fetchHands(false);
  }, [fetchHands]);

  const handleSelectHand = useCallback((handId: string) => {
    setSelectedHandId(handId);
  }, []);

  const handleCloseReplay = useCallback(() => {
    setSelectedHandId(null);
  }, []);

  const handleFiltersChange = useCallback((newFilters: HandListFilters) => {
    setFilters(newFilters);
  }, []);

  // ---------- Render ----------

  // If a hand is selected, show the replay viewer
  if (selectedHandId) {
    return (
      <ErrorBoundary>
        <ReplayViewer handId={selectedHandId} onClose={handleCloseReplay} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-white">Hand History</h1>

        {loading && hands.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" message="Loading hand history..." />
          </div>
        ) : (
          <HandList
            hands={hands}
            total={total}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
            onSelectHand={handleSelectHand}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
