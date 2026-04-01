import React from 'react';

// ── Types ────────────────────────────────────────────────────
interface ProfitCurvePoint {
  handNumber: number;
  cumulativeProfitBB: number;
}

interface SessionSummary {
  sessionId?: string;
  totalHands: number;
  profitLoss: number;
  profitCurve: ProfitCurvePoint[];
  stats: {
    winRateBBPer100: number;
    showdownPct: number;
    foldPct: number;
    vpipPct: number;
    foldToCbetPct?: number;
  };
  gtoConformanceScore: number;
  worstHands?: {
    handNumber: number;
    evLoss: number;
    holeCards?: { rank: string; suit: string }[];
  }[];
}

interface LobbyScreenProps {
  lastSessionStats?: SessionSummary;
  hasActiveSession?: boolean;
  onStartSession: () => void;
  onResumeSession: () => void;
  onViewHistory: () => void;
}

// ── Helpers ──────────────────────────────────────────────────
function gtoScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-500';
}

function gtoScoreBg(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-500';
}

function formatProfit(bb: number): string {
  const sign = bb >= 0 ? '+' : '';
  return `${sign}${bb.toFixed(1)} BB`;
}

// ── Component ────────────────────────────────────────────────
export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  lastSessionStats,
  hasActiveSession = false,
  onStartSession,
  onResumeSession,
  onViewHistory,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header placeholder — AppHeader child renders here */}
      <div id="app-header-slot" />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-800 shadow-lg mb-6">
            <span className="text-3xl">♠</span>
            <span className="text-white text-3xl font-bold ml-0.5">G</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GTO Idiot</h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            6-max No-Limit Hold'em GTO strategy trainer.
            <br />
            Play against bots, learn optimal poker.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-md">
          {hasActiveSession ? (
            <>
              <button
                onClick={onResumeSession}
                className="flex-1 px-6 py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl shadow-md transition-colors text-lg"
              >
                Resume Session
              </button>
              <button
                onClick={onStartSession}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors text-lg"
              >
                New Session
              </button>
            </>
          ) : (
            <button
              onClick={onStartSession}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors text-lg"
            >
              Start New Session
            </button>
          )}
        </div>

        {/* Last session quick stats */}
        {lastSessionStats && (
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Last Session</h2>
              <span className="text-sm text-gray-400">
                {lastSessionStats.totalHands} hands
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Profit / Loss */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Profit</p>
                <p
                  className={`text-xl font-bold ${
                    lastSessionStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatProfit(lastSessionStats.profitLoss)}
                </p>
              </div>

              {/* Win Rate */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Win Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {lastSessionStats.stats.winRateBBPer100.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">BB/100</p>
              </div>

              {/* GTO Score */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">GTO Score</p>
                <p
                  className={`text-xl font-bold ${gtoScoreColor(
                    lastSessionStats.gtoConformanceScore
                  )}`}
                >
                  {Math.round(lastSessionStats.gtoConformanceScore)}
                </p>
                <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${gtoScoreBg(
                      lastSessionStats.gtoConformanceScore
                    )}`}
                    style={{ width: `${lastSessionStats.gtoConformanceScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Extra stats row */}
            <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
              <span>VPIP {lastSessionStats.stats.vpipPct.toFixed(0)}%</span>
              <span>Showdown {lastSessionStats.stats.showdownPct.toFixed(0)}%</span>
              <span>Fold {lastSessionStats.stats.foldPct.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* View history link */}
        <button
          onClick={onViewHistory}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          View Session History
        </button>
      </main>

      {/* Footer placeholder — GlobalDisclaimerFooter child renders here */}
      <div id="global-disclaimer-footer-slot" />
    </div>
  );
};

export default LobbyScreen;