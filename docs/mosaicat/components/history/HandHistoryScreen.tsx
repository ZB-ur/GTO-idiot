import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types ---
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface HandHistoryListItem {
  handId: string;
  handNumber: number;
  timestamp: string;
  heroHoleCards: Card[];
  communityCards: Card[];
  result: 'won' | 'lost' | 'tied';
  heroProfit: number;
  gtoDeviationScore: number;
}

interface HistorySummary {
  totalHands: number;
  winRate: number;
  totalProfit: number;
}

interface HandHistoryListResponse {
  items: HandHistoryListItem[];
  total: number;
  page: number;
  perPage: number;
  summary: HistorySummary;
}

interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  total: number;
}

interface HandHistoryScreenProps {
  onSelectHand: (handId: string) => void;
}

// --- API helpers ---
async function listHandHistory(page: number, perPage: number): Promise<HandHistoryListResponse> {
  const res = await fetch(`/api/hands?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error('Failed to fetch hand history');
  return res.json();
}

async function exportHandHistory(): Promise<Blob> {
  const res = await fetch('/api/hands/export');
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

async function importHandHistory(data: unknown): Promise<ImportResult> {
  const res = await fetch('/api/hands/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Import failed');
  return res.json();
}

// --- Suit rendering ---
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = { s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900' };

function CardBadge({ card }: { card: Card }) {
  return (
    <span className={`inline-flex items-center justify-center w-8 h-10 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold ${SUIT_COLORS[card.suit]}`}>
      {card.rank}{SUIT_SYMBOLS[card.suit]}
    </span>
  );
}

// --- Sub-components ---

function HistorySummaryBar({ summary }: { summary: HistorySummary }) {
  const profitColor = summary.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500';
  const profitSign = summary.totalProfit >= 0 ? '+' : '';

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
        <p className="text-sm text-gray-500 mb-1">Hands Played</p>
        <p className="text-2xl font-bold text-gray-900">{summary.totalHands}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
        <p className="text-sm text-gray-500 mb-1">Win Rate</p>
        <p className="text-2xl font-bold text-gray-900">{summary.winRate.toFixed(1)}%</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
        <p className="text-sm text-gray-500 mb-1">Total Profit</p>
        <p className={`text-2xl font-bold ${profitColor}`}>{profitSign}{summary.totalProfit} BB</p>
      </div>
    </div>
  );
}

function HandHistoryRow({ item, onClick }: { item: HandHistoryListItem; onClick: () => void }) {
  const resultBadge = {
    won: 'bg-emerald-50 text-emerald-700',
    lost: 'bg-red-50 text-red-700',
    tied: 'bg-amber-50 text-amber-700',
  }[item.result];

  const profitColor = item.heroProfit >= 0 ? 'text-emerald-500' : 'text-red-500';
  const profitSign = item.heroProfit >= 0 ? '+' : '';

  const scoreColor =
    item.gtoDeviationScore >= 80 ? 'text-emerald-500' :
    item.gtoDeviationScore >= 50 ? 'text-amber-500' : 'text-red-500';

  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      {/* Hand number & time */}
      <div className="flex-shrink-0 w-16 text-center">
        <p className="text-lg font-bold text-gray-900">#{item.handNumber}</p>
        <p className="text-xs text-gray-500">{dateStr}</p>
        <p className="text-xs text-gray-400">{timeStr}</p>
      </div>

      {/* Hole cards */}
      <div className="flex gap-1 flex-shrink-0">
        {item.heroHoleCards.map((c, i) => (
          <CardBadge key={i} card={c} />
        ))}
      </div>

      {/* Community cards */}
      <div className="flex gap-1 flex-shrink-0">
        {item.communityCards.map((c, i) => (
          <CardBadge key={i} card={c} />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Result */}
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${resultBadge}`}>
        {item.result}
      </span>

      {/* Profit */}
      <div className="w-20 text-right">
        <p className={`text-sm font-bold ${profitColor}`}>{profitSign}{item.heroProfit} BB</p>
      </div>

      {/* GTO Score */}
      <div className="w-16 text-right">
        <p className={`text-sm font-bold ${scoreColor}`}>{item.gtoDeviationScore}</p>
        <p className="text-xs text-gray-400">GTO</p>
      </div>

      {/* Chevron */}
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function EmptyHistoryIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hands Yet</h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Play your first hand to start building your history. You can also import hands from a previous session.
      </p>
    </div>
  );
}

function FilePickerDialog({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (result: ImportResult) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importHandHistory(data);
      onImport(result);
      onClose();
    } catch {
      setError('Invalid file format. Please select a valid GTO Idiot export file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Import Hand History</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select a JSON file previously exported from GTO Idiot.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFile}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Choose File'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Screen ---

export default function HandHistoryScreen({ onSelectHand }: HandHistoryScreenProps) {
  const [data, setData] = useState<HandHistoryListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const perPage = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listHandHistory(page, perPage);
      setData(result);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const blob = await exportHandHistory();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gto-idiot-hands-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Hands exported successfully');
    } catch {
      showToast('Export failed');
    }
  };

  const handleImport = (result: ImportResult) => {
    showToast(`Imported ${result.imported} hands (${result.duplicatesSkipped} duplicates skipped)`);
    fetchData();
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = data ? Math.ceil(data.total / perPage) : 0;
  const isEmpty = data && data.items.length === 0 && page === 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hand History</h1>
            <p className="text-sm text-gray-500 mt-1">Review your past hands and track progress</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setImportDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={isEmpty || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        {data && !isEmpty && <HistorySummaryBar summary={data.summary} />}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEmpty ? (
          <EmptyHistoryIllustration />
        ) : data ? (
          <>
            {/* Hand list */}
            <div className="space-y-3">
              {data.items.map((item) => (
                <HandHistoryRow
                  key={item.handId}
                  item={item}
                  onClick={() => onSelectHand(item.handId)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Import Dialog */}
      <FilePickerDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-md animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}