import React from 'react';

export interface DeviationSummaryItem {
  hand_id: string;
  hand_number?: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  ev_loss?: number;
}

export interface SessionSummary {
  session_id: string;
  hand_count: number;
  net_profit_bb: number;
  duration_minutes: number;
  win_rate?: number;
  biggest_pot_hand_id?: string;
  key_deviations: DeviationSummaryItem[];
}

interface SessionSummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: SessionSummary;
}

const severityConfig = {
  minor: { label: '轻微', color: 'bg-green-400', textColor: 'text-green-400', dotColor: 'bg-green-400' },
  moderate: { label: '中等', color: 'bg-yellow-400', textColor: 'text-yellow-400', dotColor: 'bg-yellow-400' },
  severe: { label: '严重', color: 'bg-red-400', textColor: 'text-red-400', dotColor: 'bg-red-400' },
};

const streetLabels: Record<string, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  open,
  onClose,
  summary,
}) => {
  if (!open) return null;

  const isProfit = summary.net_profit_bb >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-50">Session 小结</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-50 hover:bg-gray-800 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Net Profit */}
            <div className="bg-gray-800 rounded-xl p-4 col-span-2">
              <p className="text-sm text-gray-400 mb-1">净盈亏</p>
              <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}{summary.net_profit_bb.toFixed(1)} BB
              </p>
            </div>

            {/* Hand Count */}
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">总手数</p>
              <p className="text-2xl font-bold text-gray-50">{summary.hand_count}</p>
            </div>

            {/* Duration */}
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">时长</p>
              <p className="text-2xl font-bold text-gray-50">{formatDuration(summary.duration_minutes)}</p>
            </div>

            {/* Win Rate */}
            {summary.win_rate !== undefined && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">胜率</p>
                <p className="text-2xl font-bold text-gray-50">{summary.win_rate.toFixed(1)}%</p>
              </div>
            )}

            {/* BB/100 approximation */}
            {summary.hand_count > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">BB/100</p>
                <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                  {((summary.net_profit_bb / summary.hand_count) * 100).toFixed(1)}
                </p>
              </div>
            )}
          </div>

          {/* Key Deviations */}
          {summary.key_deviations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                关键偏差回顾
              </h3>
              <div className="space-y-2">
                {summary.key_deviations.map((dev, i) => {
                  const config = severityConfig[dev.severity];
                  return (
                    <div
                      key={`${dev.hand_id}-${i}`}
                      className="flex items-start gap-3 bg-gray-800 rounded-lg p-3"
                    >
                      {/* Severity dot */}
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dotColor}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-medium ${config.textColor}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{dev.hand_number ?? '—'} · {streetLabels[dev.street] ?? dev.street}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-snug">
                          {dev.description}
                        </p>
                        {dev.ev_loss !== undefined && dev.ev_loss > 0 && (
                          <p className="text-xs text-red-400 mt-1">
                            EV损失: -{dev.ev_loss.toFixed(2)} BB
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {summary.key_deviations.length === 0 && (
            <div className="text-center py-4">
              <p className="text-emerald-500 font-medium">🎯 完美表现！</p>
              <p className="text-sm text-gray-400 mt-1">本次 Session 没有明显 GTO 偏差</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-xl transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;