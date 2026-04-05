import React from 'react';

interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
}

interface Session {
  sessionId: string;
  blindLevel: BlindLevel;
  buyIn: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  handCount: number;
  netResult: number;
  durationSeconds?: number | null;
}

interface SessionResumeDialogProps {
  session: Session;
  onResume: () => void;
  onNewGame: () => void;
  visible: boolean;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '--';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export const SessionResumeDialog: React.FC<SessionResumeDialogProps> = ({
  session,
  onResume,
  onNewGame,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-100 text-center mb-2">检测到未完成的游戏</h3>
        <p className="text-sm text-gray-400 text-center mb-5">是否继续上次的 Session？</p>

        {/* Session Info */}
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">盲注</span>
            <span className="text-gray-200">
              {session.blindLevel.smallBlind}/{session.blindLevel.bigBlind}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">已玩手数</span>
            <span className="text-gray-200">{session.handCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">净盈亏</span>
            <span
              className={`font-semibold ${
                session.netResult > 0
                  ? 'text-emerald-400'
                  : session.netResult < 0
                  ? 'text-red-400'
                  : 'text-gray-300'
              }`}
            >
              {session.netResult > 0 ? '+' : ''}
              {session.netResult} BB
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">时长</span>
            <span className="text-gray-200">{formatDuration(session.durationSeconds)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition-colors active:scale-[0.98]"
          >
            继续游戏
          </button>
          <button
            onClick={onNewGame}
            className="w-full py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            开始新游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionResumeDialog;