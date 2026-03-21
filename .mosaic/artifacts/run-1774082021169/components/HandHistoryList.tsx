'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Card, Position } from '@/engine/types';
import HandHistoryRow from './HandHistoryRow';
import HistoryFilter from './HistoryFilter';

interface HandHistorySummary {
  id: string;
  date: string;
  position: Position;
  holeCards: { card1: Card; card2: Card };
  result: number;
  keyAction?: string;
}

interface HandHistoryListProps {
  hands: HandHistorySummary[];
  total: number;
  loading: boolean;
  onLoadMore: () => void;
  onHandClick: (handId: string) => void;
  onFilterChange: (filters: any) => void;
}

function SkeletonRow() {
  return (
    <div className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 animate-pulse">
      <div className="w-16 h-4 bg-gray-700 rounded" />
      <div className="w-8 h-5 bg-gray-700 rounded" />
      <div className="w-14 h-5 bg-gray-700 rounded" />
      <div className="flex-1" />
      <div className="w-16 h-4 bg-gray-700 rounded" />
    </div>
  );
}

export default function HandHistoryList({
  hands,
  total,
  loading,
  onLoadMore,
  onHandClick,
  onFilterChange,
}: HandHistoryListProps) {
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <HistoryFilter
        filters={{}}
        onChange={onFilterChange}
      />

      {/* Count */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          Showing <span className="text-white font-mono">{hands.length}</span> of{' '}
          <span className="text-white font-mono">{total.toLocaleString()}</span> hands
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {loading && hands.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : (
          <AnimatePresence mode="popLayout">
            {hands.map((hand, index) => (
              <motion.div
                key={hand.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <HandHistoryRow hand={hand} onClick={onHandClick} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load more */}
      {hands.length < total && !loading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {loading && hands.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}