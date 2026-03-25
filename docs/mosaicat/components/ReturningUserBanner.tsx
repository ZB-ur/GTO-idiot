import React from 'react';

interface ReturningUserBannerProps {
  totalHands: number;
  overallWinRate: number;
  gtoConformance: number;
  lastPlayedAt: string;
  onContinue: () => void;
  onNewGame: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

function getGtoColor(conformance: number): string {
  if (conformance >= 70) return 'text-emerald-400';
  if (conformance >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export const ReturningUserBanner: React.FC<ReturningUserBannerProps> = ({
  totalHands,
  overallWinRate,
  gtoConformance,
  lastPlayedAt,
  onContinue,
  onNewGame,
}) => {
  return (
    <div
      className="w-full max-w-3xl rounded-xl border border-gray-700 p-6 mx-auto"
      style={{ background: '#1e293b' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-100 text-lg font-semibold">Welcome Back!</h3>
          <p className="text-gray-500 text-sm">Last played {formatRelativeTime(lastPlayedAt)}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-100">{totalHands}</p>
          <p className="text-gray-500 text-xs">Hands Played</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${overallWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
            {overallWinRate.toFixed(1)}%
          </p>
          <p className="text-gray-500 text-xs">Win Rate</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${getGtoColor(gtoConformance)}`}>
            {gtoConformance.toFixed(1)}%
          </p>
          <p className="text-gray-500 text-xs">GTO Score</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
        >
          Continue Playing
        </button>
        <button
          onClick={onNewGame}
          className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default ReturningUserBanner;