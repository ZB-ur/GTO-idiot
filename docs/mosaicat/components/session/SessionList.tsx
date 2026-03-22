'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/common/EmptyState';

export interface SessionSummaryItem {
  id: string;
  date: Date;
  handCount: number;
  profitLossBB: number;
  gtoConformance: number;
  duration: number;
  status: 'completed' | 'paused' | 'active';
}

type SortField = 'date' | 'handCount' | 'profitLossBB' | 'gtoConformance';
type SortOrder = 'asc' | 'desc';

interface SessionListProps {
  sessions: SessionSummaryItem[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  sortBy?: string;
  sortOrder?: string;
}

const SORT_LABELS: Record<SortField, string> = {
  date: 'Date',
  handCount: 'Hands',
  profitLossBB: 'P/L',
  gtoConformance: 'GTO %',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getConformanceColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400';
  if (pct >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getConformanceBg(pct: number): string {
  if (pct >= 80) return 'bg-emerald-900/50';
  if (pct >= 60) return 'bg-yellow-900/50';
  return 'bg-red-900/50';
}

export function SessionList({
  sessions,
  onSelectSession,
  onDeleteSession,
  sortBy: initialSortBy = 'date',
  sortOrder: initialSortOrder = 'desc',
}: SessionListProps) {
  const [sortField, setSortField] = useState<SortField>(initialSortBy as SortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder as SortOrder);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'date':
          aVal = a.date.getTime();
          bVal = b.date.getTime();
          break;
        case 'handCount':
          aVal = a.handCount;
          bVal = b.handCount;
          break;
        case 'profitLossBB':
          aVal = a.profitLossBB;
          bVal = b.profitLossBB;
          break;
        case 'gtoConformance':
          aVal = a.gtoConformance;
          bVal = b.gtoConformance;
          break;
        default:
          aVal = a.date.getTime();
          bVal = b.date.getTime();
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [sessions, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = (id: string) => {
    onDeleteSession(id);
    setDeletingId(null);
  };

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No sessions yet"
        description="Start a practice session to begin tracking your GTO progress."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-gray-500 mr-1">Sort by:</span>
        {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              sortField === field
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {SORT_LABELS[field]}
            {sortField === field && (
              <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
        ))}
      </div>

      {/* Session rows */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedSessions.map((session, index) => {
            const isProfit = session.profitLossBB >= 0;
            const formattedPL = `${isProfit ? '+' : ''}${session.profitLossBB.toFixed(1)}`;

            return (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full text-left bg-gray-800/80 border border-gray-700 rounded-xl p-4
                             hover:border-gray-600 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: date + duration */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-gray-200">
                          {formatDate(session.date)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {session.handCount} hand{session.handCount !== 1 ? 's' : ''}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConformanceBg(session.gtoConformance)} ${getConformanceColor(session.gtoConformance)}`}
                        >
                          GTO {session.gtoConformance.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Right: P/L + delete */}
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formattedPL}
                          <span className="text-xs font-normal text-gray-500 ml-1">BB</span>
                        </div>
                      </div>

                      {/* Delete button */}
                      {deletingId === session.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => confirmDelete(session.id)}
                            className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-500 text-white transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                                     text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition-all"
                          title="Delete session"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}