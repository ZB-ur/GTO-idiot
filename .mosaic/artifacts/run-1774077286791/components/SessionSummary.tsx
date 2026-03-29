import React from 'react';

export interface SessionSummaryData {
  totalHands: number;
  profitLoss: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number;
  avgDecisionQuality: number;
  totalPlayTime: string;
  vpipRate: number;
  pfr: number;
}

export interface SessionSummaryProps {
  summary: SessionSummaryData;
  onBackToHome: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ summary, onBackToHome }) => {
  const isProfit = summary.profitLoss >= 0;
  const qualityColor =
    summary.avgDecisionQuality >= 80
      ? 'text-emerald-400'
      : summary.avgDecisionQuality >= 50
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden max-w-md w-full mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border-b border-gray-700 px-6 py-5 text-center">
        <div className="text-gray-400 text-xs uppercase tracking-wider font-medium">Session 结束</div>
        <div
          className={`text-3xl font-bold mt-2 tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {isProfit ? '+' : ''}{summary.profitLoss.toFixed(1)} BB
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {summary.totalHands} 局 · {summary.totalPlayTime}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-700">
        {/* Win rate */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">胜率</div>
          <div className="text-white text-lg font-bold tabular-nums">{summary.winRate.toFixed(0)}%</div>
        </div>
        {/* Decision quality */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">决策质量</div>
          <div className={`text-lg font-bold tabular-nums ${qualityColor}`}>{summary.avgDecisionQuality}</div>
        </div>
        {/* Biggest win */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">最大赢利</div>
          <div className="text-emerald-400 text-lg font-bold tabular-nums">+{summary.biggestWin.toFixed(1)}</div>
        </div>
        {/* Biggest loss */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">最大亏损</div>
          <div className="text-red-400 text-lg font-bold tabular-nums">{summary.biggestLoss.toFixed(1)}</div>
        </div>
        {/* VPIP */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">VPIP</div>
          <div className="text-white text-lg font-bold tabular-nums">{summary.vpipRate.toFixed(0)}%</div>
        </div>
        {/* PFR */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="text-gray-500 text-xs">PFR</div>
          <div className="text-white text-lg font-bold tabular-nums">{summary.pfr.toFixed(0)}%</div>
        </div>
      </div>

      {/* Action */}
      <div className="px-6 py-4 border-t border-gray-700">
        <button
          onClick={onBackToHome}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold
            hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
        >
          返回大厅
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;