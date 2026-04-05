import React from 'react';

interface SessionSummary {
  sessionId: string;
  handCount: number;
  netResult: number;
  durationSeconds: number;
}

interface SessionSummaryPanelProps {
  summary: SessionSummary;
  visible: boolean;
  onViewHistory: () => void;
  onGoHome: () => void;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export const SessionSummaryPanel: React.FC<SessionSummaryPanelProps> = ({
  summary,
  visible,
  onViewHistory,
  onGoHome,
}) => {
  if (!visible) return null;

  const isPositive = summary.netResult > 0;
  const isNegative = summary.netResult < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
        {/* Result Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isPositive
              ? 'bg-emerald-500/20'
              : isNegative
              ? 'bg-red-500/20'
              : 'bg-gray-700/50'
          }`}
        >
          {isPositive ? (
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : isNegative ? (
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-100 text-center mb-1">游戏结束</h3>
        <p className="text-sm text-gray-400 text-center mb-6">以下是本次 Session 汇总</p>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          {/* Net Result - Hero Stat */}
          <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">净盈亏</div>
            <div
              className={`text-3xl font-bold ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              {summary.netResult > 0 ? '+' : ''}
              {summary.netResult} BB
            </div>
          </div>

          {/* Hand Count & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">总手数</div>
              <div className="text-2xl font-bold text-gray-100">{summary.handCount}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">游玩时长</div>
              <div className="text-2xl font-bold text-gray-100">
                {formatDuration(summary.durationSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onViewHistory}
            className="w-full py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition-colors active:scale-[0.98]"
          >
            查看手牌记录
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryPanel;