import React from 'react';

export interface Session {
  id: string;
  status: 'active' | 'paused' | 'completed';
  stackDepthBB: number;
  handCount: number;
  profitLossBB: number;
  createdAt: string;
  updatedAt: string;
}

interface RecentSessionCardProps {
  session: Session;
  onClick: (sessionId: string) => void;
}

const statusConfig: Record<Session['status'], { label: string; dot: string; bg: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paused: { label: 'Paused', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  completed: { label: 'Completed', dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatProfitLoss(bb: number): string {
  const sign = bb >= 0 ? '+' : '';
  return `${sign}${bb.toFixed(1)} BB`;
}

export const RecentSessionCard: React.FC<RecentSessionCardProps> = ({ session, onClick }) => {
  const isProfit = session.profitLossBB >= 0;
  const status = statusConfig[session.status];

  return (
    <button
      onClick={() => onClick(session.id)}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-150 cursor-pointer group"
    >
      {/* Top row: date + status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{formatDate(session.createdAt)}</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Profit/Loss — hero number */}
      <div className="mb-3">
        <p
          className={`text-2xl font-bold ${
            isProfit ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {formatProfitLoss(session.profitLossBB)}
        </p>
      </div>

      {/* Bottom row: hand count + stack depth */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          <span>{session.handCount} hands</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
          </svg>
          <span>{session.stackDepthBB} BB</span>
        </div>
      </div>

      {/* Subtle hover arrow */}
      <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </button>
  );
};

export default RecentSessionCard;