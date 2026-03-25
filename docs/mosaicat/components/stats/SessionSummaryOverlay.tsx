import React, { useEffect, useCallback } from 'react';

interface SessionStats {
  gameId: string;
  handsPlayed: number;
  profit: number;
  vpip: number;
  pfr: number;
  winRate: number;
  gtoDeviationScore: number;
}

interface ProgressionHint {
  shouldShow: boolean;
  currentDifficulty: 'fish' | 'regular' | 'gto';
  suggestedDifficulty?: 'fish' | 'regular' | 'gto';
  currentAverageScore: number;
  threshold?: number;
  message?: string;
}

interface SessionSummaryOverlayProps {
  stats: SessionStats;
  progressionHint: ProgressionHint | null;
  onClose: () => void;
  onTryHarder: () => void;
}

function profitColor(val: number): string {
  return val >= 0 ? 'text-emerald-600' : 'text-red-500';
}

function profitSign(val: number): string {
  return val >= 0 ? '+' : '';
}

function gtoScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function gtoRingColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function difficultyLabel(d: string): string {
  const labels: Record<string, string> = { fish: 'Fish', regular: 'Regular', gto: 'GTO' };
  return labels[d] ?? d;
}

export const SessionSummaryOverlay: React.FC<SessionSummaryOverlayProps> = ({
  stats,
  progressionHint,
  onClose,
  onTryHarder,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (stats.gtoDeviationScore / 100) * circumference;
  const showHint = progressionHint?.shouldShow && progressionHint?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-md w-full mx-4 bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Session Complete</h2>
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
          {/* GTO Score Gauge — centered */}
          <div className="flex flex-col items-center mb-5">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke={gtoRingColor(stats.gtoDeviationScore)}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="46" textAnchor="middle" fill={gtoRingColor(stats.gtoDeviationScore)} fontSize="22" fontWeight="bold">
                {stats.gtoDeviationScore}
              </text>
              <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="500">
                GTO Score
              </text>
            </svg>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hands</span>
              <span className="text-2xl font-bold text-gray-900">{stats.handsPlayed}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profit / Loss</span>
              <span className={`text-2xl font-bold ${profitColor(stats.profit)}`}>
                {profitSign(stats.profit)}{stats.profit}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">VPIP</span>
              <span className="text-2xl font-bold text-gray-900">{stats.vpip}%</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">PFR</span>
              <span className="text-2xl font-bold text-gray-900">{stats.pfr}%</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-1 col-span-2">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Win Rate</span>
              <span className="text-2xl font-bold text-gray-900">{stats.winRate}%</span>
            </div>
          </div>

          {/* Progression Hint Banner */}
          {showHint && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-2">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Ready for a Challenge?</p>
                <p className="text-xs text-amber-700 mt-0.5">{progressionHint!.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-slate-50 rounded-b-xl">
          {showHint && (
            <button
              onClick={onTryHarder}
              className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Try {progressionHint!.suggestedDifficulty ? difficultyLabel(progressionHint!.suggestedDifficulty) : 'Harder'} Bots
            </button>
          )}
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

export default SessionSummaryOverlay;