'use client';

import { useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HandHistoryCard } from './HandHistoryCard';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { Card } from '@/engine/types';

type HandResult = 'won' | 'lost' | 'tied';

interface HandHistoryListItem {
  handId: string;
  handNumber: number;
  timestamp: string;
  heroHoleCards: [Card, Card];
  communityCards: Card[];
  result: HandResult;
  heroProfit: number;
  gtoDeviationScore: number;
}

interface HandHistoryListProps {
  hands: HandHistoryListItem[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectHand: (handId: string) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-700/60 bg-[#1e293b] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="w-10 h-14 rounded-lg" />
            <Skeleton className="w-10 h-14 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-6" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function HandHistoryList({
  hands,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectHand,
}: HandHistoryListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Initial loading state
  if (isLoading && hands.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && hands.length === 0) {
    return (
      <EmptyState
        title="No hands found"
        description="Play some hands or adjust your filters to see results here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {hands.map((hand, index) => (
          <motion.div
            key={hand.handId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
          >
            <HandHistoryCard hand={hand} onClick={onSelectHand} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      {isLoading && hands.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && !isLoading && (
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      )}

      {/* End of list */}
      {!hasMore && hands.length > 0 && (
        <p className="text-center text-xs text-gray-500 py-4">
          All {hands.length} hands loaded
        </p>
      )}
    </div>
  );
}