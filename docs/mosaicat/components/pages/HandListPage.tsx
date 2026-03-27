import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../layout/PageContainer';
import { HandListFilterBar } from '../organisms/HandListFilterBar';
import { HandListItem } from '../molecules/HandListItem';
import { EmptyHandListState } from '../atoms/EmptyHandListState';
import { FilterEmptyState } from '../atoms/FilterEmptyState';
import { HandListSkeleton } from '../atoms/HandListSkeleton';

export type HandResult = 'win' | 'lose' | 'fold';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface HandRecord {
  id: string;
  holeCards: [string, string];
  position: Position;
  result: HandResult;
  profitBB: number;
  boardCards?: string[];
  timestamp: string;
  blindLevel: string;
  potSizeBB: number;
  lastStreet: 'preflop' | 'flop' | 'turn' | 'river';
}

export interface HandListFilters {
  result?: HandResult;
  position?: Position;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'newest' | 'oldest' | 'profit_desc' | 'profit_asc';
}

export function HandListPage() {
  const [hands, setHands] = useState<HandRecord[]>([]);
  const [filters, setFilters] = useState<HandListFilters>({ dateRange: 'all', sortBy: 'newest' });
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(true);

  const fetchHands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.result) params.set('result', filters.result);
      if (filters.position) params.set('position', filters.position);
      if (filters.dateRange && filters.dateRange !== 'all') params.set('date_range', filters.dateRange);
      if (filters.sortBy) params.set('sort', filters.sortBy);

      const res = await fetch(`/api/hands?${params.toString()}`);
      const data = await res.json();
      setHands(data.hands ?? []);
      setHasPlayed(data.totalCount > 0);
    } catch {
      setHands([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHands();
  }, [fetchHands]);

  const handleFilterChange = (newFilters: HandListFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = !!(filters.result || filters.position || (filters.dateRange && filters.dateRange !== 'all'));

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-50">手牌记录</h1>
            <p className="mt-1 text-sm text-gray-400">
              浏览和回顾你的对局历史
            </p>
          </div>
          {!loading && hasPlayed && (
            <div className="text-sm text-gray-500">
              共 {hands.length} 手
            </div>
          )}
        </div>

        {/* Filter Bar */}
        {hasPlayed && (
          <HandListFilterBar
            filters={filters}
            onChange={handleFilterChange}
          />
        )}

        {/* Content */}
        {loading ? (
          <HandListSkeleton />
        ) : !hasPlayed ? (
          <EmptyHandListState />
        ) : hands.length === 0 && hasActiveFilters ? (
          <FilterEmptyState onClearFilters={() => setFilters({ dateRange: 'all', sortBy: 'newest' })} />
        ) : (
          <div className="space-y-3">
            {hands.map((hand) => (
              <HandListItem key={hand.id} hand={hand} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}