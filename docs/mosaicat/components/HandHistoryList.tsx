import React from 'react';

export interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface HandHistorySummary {
  handId: string;
  playedAt: string;
  blindLevel: string;
  playerPosition: string;
  holeCards: [Card, Card];
  profit: number;
  result?: 'won' | 'lost' | 'folded' | 'split';
  finalStreet?: string;
}

interface HandHistoryListProps {
  items: Array<HandHistorySummary>;
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onHandClick: (handId: string) => void;
}

const suitSymbols: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-900' },
  h: { symbol: '♥', color: 'text-red-600' },
  d: { symbol: '♦', color: 'text-red-600' },
  c: { symbol: '♣', color: 'text-gray-900' },
};

const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const suit = suitSymbols[card.suit];
  return (
    <span className={`inline-flex items-center justify-center w-8 h-10 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold ${suit.color}`}>
      {card.rank}{suit.symbol}
    </span>
  );
};

const resultConfig: Record<string, { label: string; color: string }> = {
  won: { label: 'Won', color: 'text-emerald-600' },
  lost: { label: 'Lost', color: 'text-red-500' },
  folded: { label: 'Folded', color: 'text-gray-400' },
  split: { label: 'Split', color: 'text-amber-500' },
};

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-16 h-5 bg-gray-200 rounded" />
    <div className="flex gap-1">
      <div className="w-8 h-10 bg-gray-200 rounded-md" />
      <div className="w-8 h-10 bg-gray-200 rounded-md" />
    </div>
    <div className="flex-1" />
    <div className="w-12 h-5 bg-gray-200 rounded" />
    <div className="w-16 h-5 bg-gray-200 rounded" />
  </div>
);

const HandHistoryList: React.FC<HandHistoryListProps> = ({
  items,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onHandClick,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (!loading && items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-4xl mb-3">🃏</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No hands played yet</h3>
        <p className="text-sm text-gray-500">Start a game to see your hand history here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-slate-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span className="w-16">Time</span>
        <span className="w-20">Cards</span>
        <span className="w-10">Pos</span>
        <span className="w-12">Blinds</span>
        <span className="flex-1">Result</span>
        <span className="w-20 text-right">Profit</span>
      </div>

      {/* Rows */}
      {loading ? (
        Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
      ) : (
        items.map((item) => {
          const result = item.result ? resultConfig[item.result] : null;
          const profitPositive = item.profit >= 0;

          return (
            <div
              key={item.handId}
              onClick={() => onHandClick(item.handId)}
              className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <span className="w-16 text-xs text-gray-400">
                {new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="w-20 flex gap-1">
                <CardDisplay card={item.holeCards[0]} />
                <CardDisplay card={item.holeCards[1]} />
              </div>
              <span className="w-10 text-xs font-medium text-gray-600">{item.playerPosition}</span>
              <span className="w-12 text-xs text-gray-500">{item.blindLevel}</span>
              <span className={`flex-1 text-sm font-medium ${result?.color || 'text-gray-500'}`}>
                {result?.label || '—'}
                {item.finalStreet && (
                  <span className="text-xs text-gray-400 ml-1 capitalize">({item.finalStreet})</span>
                )}
              </span>
              <span
                className={`w-20 text-right text-sm font-bold font-mono ${
                  profitPositive ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {profitPositive ? '+' : ''}{item.profit}
              </span>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 text-xs font-medium rounded-lg ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandHistoryList;