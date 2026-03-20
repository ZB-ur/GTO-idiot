import React, { useState, useEffect } from 'react';

interface Session {
  id: string;
  status: 'active' | 'paused' | 'completed';
  stackDepthBB: number;
  handCount: number;
  profitLossBB: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionListResponse {
  sessions: Session[];
  total: number;
}

interface HomePageProps {
  onNewSession?: () => void;
  onContinueSession?: (sessionId: string) => void;
  onViewSession?: (sessionId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onNewSession,
  onContinueSession,
  onViewSession,
}) => {
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions?limit=5');
        const data: SessionListResponse = await res.json();
        setRecentSessions(data.sessions);
        const active = data.sessions.find(
          (s) => s.status === 'active' || s.status === 'paused'
        );
        if (active) setActiveSession(active);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${month} ${day}, ${time}`;
  };

  const formatProfit = (bb: number) => {
    const sign = bb >= 0 ? '+' : '';
    return `${sign}${bb.toFixed(1)} BB`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GTO Idiot</h1>
          <p className="mt-1 text-base text-gray-500">
            Texas Hold'em GTO Trainer — 6-max NLHE
          </p>
        </div>

        {/* Quick Start Panel */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Session */}
            <button
              onClick={onNewSession}
              className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">
                  New Session
                </div>
                <div className="text-sm text-gray-500">
                  Start a fresh 6-max table
                </div>
              </div>
            </button>

            {/* Continue Session */}
            <button
              onClick={() =>
                activeSession && onContinueSession?.(activeSession.id)
              }
              disabled={!activeSession}
              className={`flex items-center gap-4 p-6 bg-white border rounded-xl shadow-sm text-left transition-all ${
                activeSession
                  ? 'border-gray-200 hover:border-emerald-300 hover:shadow-md group'
                  : 'border-gray-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  activeSession
                    ? 'bg-emerald-50 group-hover:bg-emerald-100'
                    : 'bg-gray-50'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeSession ? 'text-emerald-500' : 'text-gray-300'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">
                  Continue Session
                </div>
                <div className="text-sm text-gray-500">
                  {activeSession
                    ? `${activeSession.handCount} hands · ${formatProfit(activeSession.profitLossBB)}`
                    : 'No active session'}
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Sessions
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-white border border-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 bg-white border border-gray-200 rounded-xl text-center">
              <p className="text-gray-400 text-sm">
                No sessions yet. Start your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onViewSession?.(session.id)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Status dot */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        session.status === 'active'
                          ? 'bg-emerald-500'
                          : session.status === 'paused'
                            ? 'bg-amber-500'
                            : 'bg-gray-300'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.stackDepthBB}BB · {session.handCount} hands
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDate(session.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      session.profitLossBB >= 0
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    }`}
                  >
                    {formatProfit(session.profitLossBB)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;