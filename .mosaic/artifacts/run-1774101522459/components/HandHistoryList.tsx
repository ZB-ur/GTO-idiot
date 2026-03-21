import React, { useState, useRef, useCallback, useEffect } from 'react';
import HandHistoryItem from './HandHistoryItem';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';

// ── Types matching API schema ───────────────────────────────────
type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';
type Street = 'preflop' | 'flop' | 'turn' | 'river';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface HandHistorySummary {
  id: string;
  sessionId: string;
  timestamp: string;
  handNumber?: number;
  userPosition: Position;
  userHoleCards: Card[];
  communityCards?: Card[];
  result: 'won' | 'lost' | 'folded';
  profitLossBB: number;
  reachedStreet?: Street;
}

export interface HandHistoryListProps {
  hands: HandHistorySummary[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (handId: string) => void;
  onDelete: (handId: string) => void;
  onReplay: (handId: string) => void;
}

// ── Infinite scroll sentinel ────────────────────────────────────
const LoadMoreSentinel: React.FC<{
  hasMore: boolean;
  isLoading: boolean;
  onIntersect: () => void;
}> = ({ hasMore, isLoading, onIntersect }) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersect();
      },
      { rootMargin: '200px' },
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoading, onIntersect]);

  if (!hasMore) return null;

  return (
    <div ref={sentinelRef} className="flex justify-center py-6">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading more...
        </div>
      )}
    </div>
  );
};

// ── Skeleton loader for initial load ────────────────────────────
const HandListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl">
        <Skeleton variant="text" width="48px" height="14px" />
        <Skeleton variant="rect" width="40px" height="24px" />
        <div className="flex gap-1">
          <Skeleton variant="rect" width="28px" height="38px" />
          <Skeleton variant="rect" width="28px" height="38px" />
        </div>
        <Skeleton variant="text" width="50px" height="20px" />
        <div className="flex-1" />
        <Skeleton variant="text" width="60px" height="16px" />
        <Skeleton variant="rect" width="16px" height="16px" />
      </div>
    ))}
  </div>
);

// ── Main Component ──────────────────────────────────────────────
export const HandHistoryList: React.FC<HandHistoryListProps> = ({
  hands,
  isLoading,
  hasMore,
  onLoadMore,
  onSelect,
  onDelete,
  onReplay,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // Group hands by date for visual grouping
  const groupedHands = React.useMemo(() => {
    const groups: { date: string; label: string; items: HandHistorySummary[] }[] = [];
    const map = new Map<string, HandHistorySummary[]>();

    for (const hand of hands) {
      const dateKey = new Date(hand.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(hand);
    }

    for (const [dateKey, items] of map) {
      const d = new Date(dateKey + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label: string;
      if (d.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }

      groups.push({ date: dateKey, label, items });
    }

    return groups;
  }, [hands]);

  // Initial loading state
  if (isLoading && hands.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hand History</h1>
            <p className="text-sm text-gray-600 mt-1">Loading your hand records...</p>
          </div>
        </div>
        <HandListSkeleton />
      </div>
    );
  }

  // Empty state
  if (!isLoading && hands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hand History</h1>
          <p className="text-sm text-gray-600 mt-1">0 hands recorded</p>
        </div>
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1.5}>
              <rect x="8" y="12" width="48" height="40" rx="4" />
              <path d="M8 24h48" />
              <circle cx="32" cy="38" r="6" />
              <path d="M29 38l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No hand history yet"
          description="Start a new session and play some hands to see your history here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hand History</h1>
          <p className="text-sm text-gray-600 mt-1">
            {hands.length} hand{hands.length !== 1 ? 's' : ''} loaded
            {hasMore ? ' (scroll for more)' : ''}
          </p>
        </div>
      </div>

      {/* Hand list grouped by date */}
      <div className="space-y-8">
        {groupedHands.map((group) => {
          const sessionProfit = group.items.reduce((s, h) => s + h.profitLossBB, 0);
          const profitColor = sessionProfit >= 0 ? 'text-emerald-600' : 'text-red-500';

          return (
            <div key={group.date} className="space-y-2">
              {/* Date header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-700">{group.label}</h2>
                  <span className="text-xs text-gray-400">
                    {group.items.length} hand{group.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${profitColor}`}>
                  {sessionProfit >= 0 ? '+' : ''}{sessionProfit.toFixed(1)} BB
                </span>
              </div>

              {/* Hand items */}
              <div className="space-y-2">
                {group.items.map((hand) => (
                  <div key={hand.id} className="group relative">
                    <HandHistoryItem
                      id={hand.id}
                      timestamp={hand.timestamp}
                      userPosition={hand.userPosition}
                      userHoleCards={hand.userHoleCards}
                      result={hand.result}
                      profitLossBB={hand.profitLossBB}
                      onSelect={onSelect}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                    {/* Replay button overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplay(hand.id);
                      }}
                      className="
                        absolute right-14 top-1/2 -translate-y-1/2
                        inline-flex items-center gap-1.5 px-3 py-1.5
                        text-xs font-medium text-blue-600 bg-blue-50
                        rounded-lg opacity-0 group-hover:opacity-100
                        hover:bg-blue-100 transition-all duration-150
                      "
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Replay
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll sentinel */}
      <LoadMoreSentinel
        hasMore={hasMore}
        isLoading={isLoading}
        onIntersect={onLoadMore}
      />

      {/* No more hands indicator */}
      {!hasMore && hands.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-4">
          All hands loaded
        </p>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Hand Record"
        message="This will permanently delete this hand history record. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default HandHistoryList;