import React from 'react';

export interface SessionSummary {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  handsPlayed: number;
  netProfitBB: number;
  status: 'active' | 'completed';
}

export interface SessionCardProps {
  session: SessionSummary;
  onContinue: (sessionId: string) => void;
  onReview: (sessionId: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

function formatProfit(bb: number): { text: string; colorClass: string } {
  const sign = bb > 0 ? '+' : '';
  return {
    text: `${sign}${bb.toFixed(1)} BB`,
    colorClass: bb > 0 ? 'text-emerald-500' : bb < 0 ? 'text-red-500' : 'text-gray-400',
  };
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onContinue, onReview }) => {
  const profit = formatProfit(session.netProfitBB);
  const isActive = session.status === 'active';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-gray-600 transition-colors">
      {/* Left: Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-50 text-base font-semibold truncate">
            {formatDate(session.createdAt)}
          </span>
          {isActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
              进行中
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{session.handsPlayed} 手</span>
          <span className={`font-semibold ${profit.colorClass}`}>{profit.text}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive ? (
          <button
            onClick={() => onContinue(session.sessionId)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold rounded-lg transition-colors"
          >
            继续
          </button>
        ) : (
          <button
            onClick={() => onReview(session.sessionId)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-50 text-sm font-semibold rounded-lg border border-gray-700 transition-colors"
          >
            复盘
          </button>
        )}
      </div>
    </div>
  );
};