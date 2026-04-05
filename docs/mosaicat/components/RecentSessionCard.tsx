import React from 'react';

interface Session {
  id: string;
  config: {
    startingStackBB: number;
    blindLevel: { smallBlind: number; bigBlind: number };
    botSeats: Array<{ seatNumber: number; profile: string }>;
  };
  status: 'active' | 'completed';
  handsPlayed: number;
  netResult: number;
  gtoAlignmentScore?: number;
  createdAt: string;
  endedAt?: string;
}

interface RecentSessionCardProps {
  session: Session;
  onClick: (sessionId: string) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatChips = (amount: number): string => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${amount}`;
};

export const RecentSessionCard: React.FC<RecentSessionCardProps> = ({ session, onClick }) => {
  const isPositive = session.netResult >= 0;

  return (
    <button
      onClick={() => onClick(session.id)}
      className="w-full text-left bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-gray-500 hover:bg-gray-800/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-gray-50 text-sm font-semibold">
            {formatDate(session.createdAt)}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {session.handsPlayed} hands • {session.status === 'active' ? 'In Progress' : 'Completed'}
          </p>
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {formatChips(session.netResult)} BB
        </span>
      </div>

      {/* GTO Score Bar */}
      {session.gtoAlignmentScore !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${session.gtoAlignmentScore}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
            {session.gtoAlignmentScore.toFixed(0)}% GTO
          </span>
        </div>
      )}

      {/* Arrow indicator */}
      <div className="flex justify-end mt-2">
        <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
};