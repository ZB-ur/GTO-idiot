// ============================================================
// GTO Idiot — Home Page
// Landing page with quick-start, session recovery, and recent sessions
// ============================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/session-store';
import { useUIStore } from '../../stores/ui-store';
import { SESSION_CONFIG_MODAL_ID } from '../session/SessionConfigModal';
import LoadingSpinner from '../common/LoadingSpinner';

export default function HomePage() {
  const navigate = useNavigate();
  const openModal = useUIStore((s) => s.openModal);
  const addToast = useUIStore((s) => s.addToast);

  const currentSession = useSessionStore((s) => s.currentSession);
  const recoverableSession = useSessionStore((s) => s.recoverableSession);
  const recoveryChecked = useSessionStore((s) => s.recoveryChecked);
  const checkRecovery = useSessionStore((s) => s.checkRecovery);
  const recoverExistingSession = useSessionStore((s) => s.recoverExistingSession);
  const dismissRecovery = useSessionStore((s) => s.dismissRecovery);
  const sessions = useSessionStore((s) => s.sessions);
  const sessionsLoading = useSessionStore((s) => s.sessionsLoading);
  const fetchSessions = useSessionStore((s) => s.fetchSessions);

  // Check for recoverable session on mount
  useEffect(() => {
    if (!recoveryChecked) {
      checkRecovery();
    }
    fetchSessions({ limit: 5 });
  }, []);

  const handleNewSession = () => {
    openModal(SESSION_CONFIG_MODAL_ID);
  };

  const handleContinue = () => {
    if (currentSession) {
      navigate('/play');
    }
  };

  const handleRecover = async () => {
    await recoverExistingSession();
    addToast({ type: 'success', message: 'Session recovered!' });
    navigate('/play');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-5xl font-bold text-white">
          <span className="mr-2">🃏</span>GTO Idiot
        </h1>
        <p className="text-lg text-gray-400">
          Master GTO poker strategy through practice and real-time feedback
        </p>
      </div>

      {/* Recovery banner */}
      {recoverableSession && !currentSession && (
        <div className="mb-6 rounded-xl border border-yellow-600/40 bg-yellow-600/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-400">Unfinished Session Found</p>
              <p className="mt-1 text-sm text-gray-400">
                {recoverableSession.hand_count} hands played | Stack:{' '}
                {recoverableSession.player_stack.toFixed(0)} BB
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={dismissRecovery}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-400 transition hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={handleRecover}
                className="rounded-lg bg-yellow-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-yellow-500"
              >
                Recover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {/* New Session */}
        <button
          onClick={handleNewSession}
          className="group rounded-xl border border-gray-700 bg-gray-800 p-6 text-left transition hover:border-green-500/50 hover:bg-gray-800/80"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20 text-green-400 transition group-hover:bg-green-600/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">New Session</h3>
          <p className="mt-1 text-sm text-gray-400">
            Configure opponents and start practicing
          </p>
        </button>

        {/* Continue / Resume */}
        {currentSession && currentSession.status !== 'completed' ? (
          <button
            onClick={handleContinue}
            className="group rounded-xl border border-gray-700 bg-gray-800 p-6 text-left transition hover:border-blue-500/50 hover:bg-gray-800/80"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 transition group-hover:bg-blue-600/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Continue Session</h3>
            <p className="mt-1 text-sm text-gray-400">
              Hand #{currentSession.hand_count} | {currentSession.player_stack.toFixed(0)} BB
            </p>
          </button>
        ) : (
          <button
            onClick={() => navigate('/history')}
            className="group rounded-xl border border-gray-700 bg-gray-800 p-6 text-left transition hover:border-purple-500/50 hover:bg-gray-800/80"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 transition group-hover:bg-purple-600/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Hand History</h3>
            <p className="mt-1 text-sm text-gray-400">
              Review past hands and analyze deviations
            </p>
          </button>
        )}
      </div>

      {/* Feature cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <div className="mb-2 text-2xl">🎯</div>
          <h4 className="font-semibold text-white">GTO Hints</h4>
          <p className="mt-1 text-xs text-gray-400">
            Real-time GTO strategy advice at every decision point
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <div className="mb-2 text-2xl">📊</div>
          <h4 className="font-semibold text-white">Deviation Analysis</h4>
          <p className="mt-1 text-xs text-gray-400">
            Track where your play diverges from optimal strategy
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <div className="mb-2 text-2xl">🤖</div>
          <h4 className="font-semibold text-white">Adaptive Bots</h4>
          <p className="mt-1 text-xs text-gray-400">
            Practice against Fish, Regular, and GTO-level opponents
          </p>
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Sessions</h2>
        {sessionsLoading ? (
          <LoadingSpinner size="sm" message="Loading sessions..." />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No sessions yet. Start your first session to begin practicing!
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/history?session=${session.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-left transition hover:border-gray-600"
              >
                <div>
                  <span className="text-sm font-medium text-white">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                  <span className="ml-3 text-xs text-gray-500">
                    {session.hand_count} hands
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-mono ${
                      session.player_stack >= 100
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {session.player_stack >= 100 ? '+' : ''}
                    {(session.player_stack - 100).toFixed(1)} BB
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      session.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : session.status === 'paused'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-600/30 text-gray-400'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
