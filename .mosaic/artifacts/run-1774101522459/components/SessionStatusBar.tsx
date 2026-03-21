import React, { useState, useEffect } from 'react';

interface SessionStatusBarProps {
  startedAt: string;
  handCount: number;
  profitLossBB: number;
  isPaused?: boolean;
  onPause: () => void;
  onEnd: () => void;
  className?: string;
}

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const diff = Math.floor((now - start) / 1000);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export const SessionStatusBar: React.FC<SessionStatusBarProps> = ({
  startedAt,
  handCount,
  profitLossBB,
  isPaused = false,
  onPause,
  onEnd,
  className = '',
}) => {
  const [duration, setDuration] = useState(formatDuration(startedAt));

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setDuration(formatDuration(startedAt)), 1000);
    return () => clearInterval(timer);
  }, [startedAt, isPaused]);

  const plColor = profitLossBB >= 0 ? 'text-emerald-600' : 'text-red-500';
  const plSign = profitLossBB >= 0 ? '+' : '';

  return (
    <div className={`flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center gap-6">
        {/* Duration */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-gray-900">{duration}</span>
          {isPaused && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">PAUSED</span>
          )}
        </div>

        {/* Hand count */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Hands</span>
          <span className="text-sm font-semibold text-gray-900">{handCount}</span>
        </div>

        {/* P/L */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">P/L</span>
          <span className={`text-sm font-bold ${plColor}`}>
            {plSign}{profitLossBB.toFixed(1)} BB
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPause}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={onEnd}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default SessionStatusBar;