import React, { useEffect, useCallback } from 'react';

interface SessionSummary {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  handCount: number;
  profitLossBB: number;
  avgEvLossPerHand: number;
}

interface SessionSummaryModalProps {
  open: boolean;
  summary: SessionSummary;
  onClose: () => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  open,
  summary,
  onClose,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const plColor = summary.profitLossBB >= 0 ? 'text-emerald-600' : 'text-red-500';
  const plSign = summary.profitLossBB >= 0 ? '+' : '';
  const evColor = summary.avgEvLossPerHand >= -0.5 ? 'text-emerald-600' : summary.avgEvLossPerHand >= -1 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full mx-4 bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Session Summary</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Time info */}
          <div className="flex items-center justify-between mb-6 px-4 py-3 bg-slate-50 rounded-lg">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 font-medium uppercase">Start</div>
              <div className="text-sm font-semibold text-gray-900">{formatTime(summary.startedAt)}</div>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-8 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-500">{formatDuration(summary.durationMinutes)}</span>
              <div className="w-8 h-px bg-gray-200" />
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-400 font-medium uppercase">End</div>
              <div className="text-sm font-semibold text-gray-900">{formatTime(summary.endedAt)}</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hands Played</span>
              <span className="text-2xl font-bold text-gray-900">{summary.handCount}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Duration</span>
              <span className="text-2xl font-bold text-gray-900">{formatDuration(summary.durationMinutes)}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profit / Loss</span>
              <span className={`text-2xl font-bold ${plColor}`}>{plSign}{summary.profitLossBB.toFixed(1)} BB</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg EV Loss</span>
              <span className={`text-2xl font-bold ${evColor}`}>{summary.avgEvLossPerHand.toFixed(2)} BB</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;