import React, { useState, useEffect, useCallback, useRef } from 'react';

// Types based on API spec
interface HandHistoryItem {
  id: string;
  sessionId: string;
  handNumber: number;
  profitLoss: number;
  keyDecisionCount: number;
  isShowdown: boolean;
  timestamp: string;
}

interface HandHistoryListResponse {
  hands: HandHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

interface DateRange {
  from: string | null;
  to: string | null;
}

interface HistoryListProps {
  onSelectHand: (handId: string) => void;
}

const ITEM_HEIGHT = 72;
const PAGE_SIZE = 20;
const OVERSCAN = 5;

export const HistoryList: React.FC<HistoryListProps> = ({ onSelectHand }) => {
  const [hands, setHands] = useState<HandHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchHands = useCallback(
    async (offset: number, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (dateRange.from) params.set('dateFrom', dateRange.from);
        if (dateRange.to) params.set('dateTo', dateRange.to);

        // In-browser service call (not HTTP)
        const response: HandHistoryListResponse = await (
          window as any
        ).gtoService.listHands(Object.fromEntries(params));

        if (append) {
          setHands((prev) => [...prev, ...response.hands]);
        } else {
          setHands(response.hands);
        }
        setTotal(response.total);
      } catch (err) {
        console.error('Failed to fetch hand history:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchHands(0);
  }, [fetchHands]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);

    // Infinite scroll: load more when near bottom
    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 200 &&
      !loadingMore &&
      hands.length < total
    ) {
      fetchHands(hands.length, true);
    }
  }, [loadingMore, hands.length, total, fetchHands]);

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value || null }));
  };

  const clearDateFilter = () => {
    setDateRange({ from: null, to: null });
  };

  // Virtual scroll calculations
  const containerHeight = containerRef.current?.clientHeight ?? 600;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    hands.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );
  const visibleHands = hands.slice(startIndex, endIndex);
  const totalHeight = hands.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPL = (pl: number) => {
    if (pl > 0) return `+${pl.toFixed(1)} BB`;
    if (pl < 0) return `${pl.toFixed(1)} BB`;
    return '0 BB';
  };

  const plColor = (pl: number) => {
    if (pl > 0) return 'text-green-500';
    if (pl < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">牌局历史</h1>
        <p className="text-sm text-gray-600">
          共 {total} 局 · 选择一局进入复盘
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={dateRange.from ?? ''}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none"
            placeholder="开始日期"
          />
          <span className="text-gray-300">—</span>
          <input
            type="date"
            value={dateRange.to ?? ''}
            onChange={(e) => handleDateChange('to', e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none"
            placeholder="结束日期"
          />
          {(dateRange.from || dateRange.to) && (
            <button
              onClick={clearDateFilter}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="px-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-36 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : hands.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6">
          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm font-medium">暂无牌局记录</p>
          <p className="text-xs mt-1">开始一局新游戏后，记录会出现在这里</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 pb-6"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleHands.map((hand) => (
                <button
                  key={hand.id}
                  onClick={() => onSelectHand(hand.id)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 mb-2 hover:border-blue-300 hover:shadow-sm transition-all group"
                  style={{ height: ITEM_HEIGHT - 8 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          # {hand.handNumber}
                        </span>
                        {hand.isShowdown && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            摊牌
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {hand.keyDecisionCount} 个决策点
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(hand.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${plColor(hand.profitLoss)}`}>
                        {formatPL(hand.profitLoss)}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryList;