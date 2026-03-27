import React, { useEffect, useState } from 'react';

interface Session {
  id: string;
  createdAt: string;
  handsPlayed: number;
  profitBB: number;
  status: 'completed' | 'in_progress';
}

interface LobbyPageProps {
  onNewGame?: () => void;
  onResumeSession?: (sessionId: string) => void;
  onViewSession?: (sessionId: string) => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  onNewGame,
  onResumeSession,
  onViewSession,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch sessions from API
    const fetchSessions = async () => {
      try {
        // Placeholder: replace with actual API call
        await new Promise((r) => setTimeout(r, 500));
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const isEmpty = !loading && sessions.length === 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-50">
              GTO Idiot
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              德州扑克 GTO 策略练习器
            </p>
          </div>
          <button
            onClick={onNewGame}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-md transition-colors hover:bg-amber-400 active:bg-amber-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            新牌局
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-amber-500" />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900 py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
              <svg
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-50">
              还没有牌局记录
            </p>
            <p className="mt-1 text-sm text-gray-500">
              开始一局新游戏，磨练你的 GTO 策略
            </p>
            <button
              onClick={onNewGame}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:bg-amber-400"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              开始第一局
            </button>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-50">历史牌局</h2>
            {sessions.map((session) => {
              const isInProgress = session.status === 'in_progress';
              const profitColor =
                session.profitBB > 0
                  ? 'text-emerald-500'
                  : session.profitBB < 0
                    ? 'text-red-500'
                    : 'text-gray-400';
              const profitPrefix = session.profitBB > 0 ? '+' : '';

              return (
                <button
                  key={session.id}
                  onClick={() =>
                    isInProgress
                      ? onResumeSession?.(session.id)
                      : onViewSession?.(session.id)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 text-left transition-colors hover:border-gray-700 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                      <svg
                        className="h-5 w-5 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 8.25h15m-16.5 7.5h6m-6-4.5h16.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-50">
                          {new Date(session.createdAt).toLocaleDateString(
                            'zh-CN',
                          )}
                        </span>
                        {isInProgress && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                            进行中
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {session.handsPlayed} 手
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${profitColor}`}>
                      {profitPrefix}
                      {session.profitBB} BB
                    </span>
                    <svg
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;