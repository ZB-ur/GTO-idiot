import React from 'react';

interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface HandHistorySummary {
  handId: string;
  handNumber: number;
  timestamp: string;
  userPosition: string;
  userHoleCards: Card[];
  netResult: number;
  gtoConformance: number;
  gtoRating: 'green' | 'yellow' | 'red' | 'gray';
  isComplete: boolean;
}

interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
}

interface HandHistoryListProps {
  hands: HandHistorySummary[];
  pagination: Pagination;
  sortBy: string;
  filterRating?: string;
  filterErrorType?: string;
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filter: { rating?: string; errorType?: string }) => void;
  onPageChange: (page: number) => void;
  onHandClick: (handId: string) => void;
  loading: boolean;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-100',
  spades: 'text-gray-100',
};

const ratingColors: Record<string, string> = {
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  yellow: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const ratingLabels: Record<string, string> = {
  green: 'GTO',
  yellow: '偏差',
  red: '错误',
  gray: '无参考',
};

function CardDisplay({ card }: { card: Card }) {
  return (
    <span className={`font-mono font-bold ${suitColors[card.suit]}`}>
      {card.rank}{suitSymbols[card.suit]}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-700 rounded w-16" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="h-6 bg-gray-700 rounded w-14" />
        <div className="h-4 bg-gray-700 rounded w-10" />
        <div className="h-4 bg-gray-700 rounded w-20" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-700 rounded w-16" />
        <div className="h-5 bg-gray-700 rounded w-24" />
      </div>
    </div>
  );
}

function EmptyStateBlock() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p className="text-gray-400 text-base font-medium mb-1">暂无牌局记录</p>
      <p className="text-gray-500 text-sm">开始一局游戏后，你的手牌历史将显示在这里</p>
    </div>
  );
}

function HandHistoryCard({
  hand,
  onClick,
}: {
  hand: HandHistorySummary;
  onClick: () => void;
}) {
  const timeStr = new Date(hand.timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#1e293b] border border-gray-700 rounded-lg p-4 hover:border-emerald-500/50 hover:bg-[#243044] transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">#{hand.handNumber}</span>
        <span className="text-gray-500 text-xs">{timeStr}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg tracking-wider">
          {hand.userHoleCards.map((c, i) => (
            <CardDisplay key={i} card={c} />
          ))}
        </span>
        <span className="text-xs font-medium text-gray-400 bg-gray-700/60 px-2 py-0.5 rounded">
          {hand.userPosition}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-base font-semibold ${
            hand.netResult > 0
              ? 'text-emerald-400'
              : hand.netResult < 0
              ? 'text-red-400'
              : 'text-gray-400'
          }`}
        >
          {hand.netResult > 0 ? '+' : ''}
          {hand.netResult.toFixed(1)} BB
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md border ${ratingColors[hand.gtoRating]}`}
        >
          {ratingLabels[hand.gtoRating]} {hand.gtoConformance.toFixed(0)}%
        </span>
      </div>
    </button>
  );
}

const sortOptions = [
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'pnl_desc', label: '盈利最高' },
  { value: 'pnl_asc', label: '亏损最多' },
  { value: 'gto_asc', label: 'GTO最低' },
];

const ratingOptions = [
  { value: '', label: '全部评级' },
  { value: 'green', label: '✅ GTO' },
  { value: 'yellow', label: '⚠️ 偏差' },
  { value: 'red', label: '❌ 错误' },
  { value: 'gray', label: '⬜ 无参考' },
];

export default function HandHistoryList({
  hands,
  pagination,
  sortBy,
  filterRating,
  filterErrorType: _filterErrorType,
  onSortChange,
  onFilterChange,
  onPageChange,
  onHandClick,
  loading,
}: HandHistoryListProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-[#334155] border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filterRating || ''}
          onChange={(e) =>
            onFilterChange({ rating: e.target.value || undefined })
          }
          className="bg-[#334155] border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
        >
          {ratingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-gray-500 text-sm">
          共 {pagination.totalItems} 局
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 min-h-[200px]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : hands.length === 0 ? (
          <EmptyStateBlock />
        ) : (
          hands.map((hand) => (
            <HandHistoryCard
              key={hand.handId}
              hand={hand}
              onClick={() => onHandClick(hand.handId)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && !loading && hands.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
            let pageNum: number;
            if (pagination.totalPages <= 7) {
              pageNum = i + 1;
            } else if (pagination.page <= 4) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.totalPages - 3) {
              pageNum = pagination.totalPages - 6 + i;
            } else {
              pageNum = pagination.page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                  pageNum === pagination.page
                    ? 'bg-emerald-500 text-white font-medium'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-400 hover:border-emerald-500/50 hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}