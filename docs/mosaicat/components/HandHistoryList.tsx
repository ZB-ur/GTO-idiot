import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Types
interface HandHistoryEntry {
  id: string;
  date: string;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  heroCards: [string, string];
  result: 'win' | 'loss' | 'fold';
  potSize: number;
  gtoScore: number; // 0-100
  street: 'preflop' | 'flop' | 'turn' | 'river';
  tags?: string[];
}

interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
  usagePercent: number;
  estimatedHandCapacity: number;
  currentHandCount: number;
  isNearFull: boolean;
}

type FilterType = 'all' | 'win' | 'loss' | 'fold';
type SortType = 'newest' | 'oldest' | 'gto-high' | 'gto-low' | 'pot-high';

interface HandHistoryListProps {
  onSelectHand: (handId: string) => void;
  onNavigateToGame: () => void;
}

// Sub-components

const SelectAllCheckbox: React.FC<{
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  count: number;
}> = ({ checked, indeterminate, onChange, count }) => {
  const ref = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {checked || indeterminate ? `已选 ${count} 手` : '全选'}
    </label>
  );
};

const DeleteHistoryButton: React.FC<{
  count: number;
  disabled: boolean;
  onClick: () => void;
}> = ({ count, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    删除{count > 0 ? ` (${count})` : ''}
  </button>
);

const ExportButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
}> = ({ disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    导出
  </button>
);

const StorageIndicator: React.FC<{ info: StorageInfo }> = ({ info }) => {
  const usedMB = (info.usedBytes / 1024 / 1024).toFixed(1);
  const totalMB = (info.totalBytes / 1024 / 1024).toFixed(1);
  const percent = Math.round(info.usagePercent * 100);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">存储空间</span>
          <span className="text-xs text-gray-400">{usedMB} / {totalMB} MB</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              info.isNearFull ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">
            {info.currentHandCount} 手已存储
          </span>
          <span className="text-xs text-gray-400">
            约可再存 {info.estimatedHandCapacity} 手
          </span>
        </div>
      </div>
      {info.isNearFull && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            空间不足
          </span>
        </div>
      )}
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-xl animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-gray-200 rounded" />
          <div className="w-10 h-5 bg-gray-200 rounded" />
          <div className="flex-1" />
          <div className="w-14 h-5 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-4 bg-gray-100 rounded" />
          <div className="flex-1" />
          <div className="w-20 h-4 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const EmptyHistoryState: React.FC<{ onNavigateToGame: () => void }> = ({ onNavigateToGame }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">暂无历史记录</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-xs">
      开始一局游戏，你的手牌分析和 GTO 评分会自动保存在这里
    </p>
    <button
      onClick={onNavigateToGame}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      开始游戏
    </button>
  </div>
);

const ApproximationDisclaimer: React.FC = () => (
  <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>GTO 评分为近似计算结果，基于简化模型得出，仅供学习参考，不代表精确 GTO 策略。</span>
  </div>
);

const cardSuitColor = (card: string): string => {
  const suit = card.slice(-1);
  return suit === 'h' || suit === 'd' ? 'text-red-600' : 'text-gray-900';
};

const formatCard = (card: string): string => {
  const rank = card.slice(0, -1);
  const suitMap: Record<string, string> = { h: '♥', d: '♦', c: '♣', s: '♠' };
  return rank + (suitMap[card.slice(-1)] || card.slice(-1));
};

const resultConfig: Record<string, { label: string; class: string }> = {
  win: { label: '赢', class: 'bg-green-100 text-green-700' },
  loss: { label: '输', class: 'bg-red-100 text-red-700' },
  fold: { label: '弃牌', class: 'bg-gray-100 text-gray-600' },
};

const HandHistoryCard: React.FC<{
  hand: HandHistoryEntry;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}> = ({ hand, selected, onToggle, onSelect }) => {
  const result = resultConfig[hand.result];
  const gtoColor =
    hand.gtoScore >= 80 ? 'text-green-600' : hand.gtoScore >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div
      className={`group p-4 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
        selected ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 font-mono text-base font-semibold">
              <span className={cardSuitColor(hand.heroCards[0])}>{formatCard(hand.heroCards[0])}</span>
              <span className={cardSuitColor(hand.heroCards[1])}>{formatCard(hand.heroCards[1])}</span>
            </div>
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              {hand.position}
            </span>
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${result.class}`}>
              {result.label}
            </span>
            <div className="flex-1" />
            <span className={`text-sm font-semibold tabular-nums ${gtoColor}`}>
              GTO {hand.gtoScore}%
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span>{hand.date}</span>
            <span>·</span>
            <span>底池 {hand.potSize} BB</span>
            <span>·</span>
            <span className="capitalize">{hand.street}</span>
            {hand.tags && hand.tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1">
                  {hand.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

// Main component
const HandHistoryList: React.FC<HandHistoryListProps> = ({ onSelectHand, onNavigateToGame }) => {
  const [hands, setHands] = useState<HandHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In-browser service calls
        const [handsRes, storageRes] = await Promise.all([
          fetch('/api/hands').then((r) => r.json()),
          fetch('/api/storage/info').then((r) => r.json()),
        ]);
        setHands(handsRes.hands || []);
        setStorageInfo(storageRes);
      } catch {
        // Fallback for client-side service layer
        setHands([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter & sort
  const filteredHands = useMemo(() => {
    let result = [...hands];

    if (filter !== 'all') {
      result = result.filter((h) => h.result === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.position.toLowerCase().includes(q) ||
          h.heroCards.some((c) => c.toLowerCase().includes(q)) ||
          h.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'oldest':
        result.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'gto-high':
        result.sort((a, b) => b.gtoScore - a.gtoScore);
        break;
      case 'gto-low':
        result.sort((a, b) => a.gtoScore - b.gtoScore);
        break;
      case 'pot-high':
        result.sort((a, b) => b.potSize - a.potSize);
        break;
      default:
        result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }, [hands, filter, sort, searchQuery]);

  // Selection
  const allSelected = filteredHands.length > 0 && selectedIds.size === filteredHands.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = useCallback(() => {
    if (allSelected || someSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHands.map((h) => h.id)));
    }
  }, [allSelected, someSelected, filteredHands]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    // In-browser delete
    setHands((prev) => prev.filter((h) => !selectedIds.has(h.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch('/api/storage/export');
      const data = await res.json();
      const blob = new Blob([data.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Handle export error
    }
  }, []);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'win', label: '赢' },
    { value: 'loss', label: '输' },
    { value: 'fold', label: '弃牌' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">手牌历史</h1>
        <span className="text-sm text-gray-400">{hands.length} 手</span>
      </div>

      {/* Storage indicator */}
      {storageInfo && <StorageIndicator info={storageInfo} />}

      {/* Approximation disclaimer */}
      {hands.length > 0 && <ApproximationDisclaimer />}

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索位置、手牌、标签…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">最新优先</option>
          <option value="oldest">最早优先</option>
          <option value="gto-high">GTO 高→低</option>
          <option value="gto-low">GTO 低→高</option>
          <option value="pot-high">底池大→小</option>
        </select>
      </div>

      {/* Batch actions */}
      {hands.length > 0 && (
        <div className="flex items-center gap-3">
          <SelectAllCheckbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleSelectAll}
            count={selectedIds.size}
          />
          <div className="flex-1" />
          <DeleteHistoryButton
            count={selectedIds.size}
            disabled={selectedIds.size === 0}
            onClick={handleDelete}
          />
          <ExportButton disabled={hands.length === 0} onClick={handleExport} />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredHands.length === 0 && hands.length === 0 ? (
        <EmptyHistoryState onNavigateToGame={onNavigateToGame} />
      ) : filteredHands.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">没有匹配的记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHands.map((hand) => (
            <HandHistoryCard
              key={hand.id}
              hand={hand}
              selected={selectedIds.has(hand.id)}
              onToggle={() => toggleSelect(hand.id)}
              onSelect={() => onSelectHand(hand.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HandHistoryList;