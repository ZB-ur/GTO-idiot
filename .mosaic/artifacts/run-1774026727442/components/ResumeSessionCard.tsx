import React from 'react';

export interface SessionListItem {
  sessionId: string;
  status: 'active' | 'paused' | 'ended';
  handCount: number;
  startTime: string;
  endTime?: string;
  totalProfit: number;
  userPosition?: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
}

interface ResumeSessionCardProps {
  session: SessionListItem;
  onResume: () => void;
  onDiscard: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatProfit(profit: number): { text: string; colorClass: string } {
  if (profit > 0) return { text: `+${profit.toFixed(1)} BB`, colorClass: 'text-green-400' };
  if (profit < 0) return { text: `${profit.toFixed(1)} BB`, colorClass: 'text-red-400' };
  return { text: '0 BB', colorClass: 'text-gray-400' };
}

export const ResumeSessionCard: React.FC<ResumeSessionCardProps> = ({
  session,
  onResume,
  onDiscard,
}) => {
  const profit = formatProfit(session.totalProfit);
  const timeAgo = formatTimeAgo(session.startTime);
  const isPaused = session.status === 'paused';

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
          <span className="text-sm font-medium text-gray-300">
            {isPaused ? 'Paused Session' : 'Active Session'}
          </span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-700/50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Hands</p>
          <p className="text-lg font-bold text-white">{session.handCount}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Profit</p>
          <p className={`text-lg font-bold ${profit.colorClass}`}>{profit.text}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Position</p>
          <p className="text-lg font-bold text-amber-400">{session.userPosition ?? '—'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onResume}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Resume
        </button>
        <button
          onClick={onDiscard}
          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default ResumeSessionCard;