import React, { useEffect } from 'react';
import { useSessionStore, sessionStore, uiStore } from '../../stores';
import { EmptyState } from '../common/EmptyState';
import { PageLoader } from '../common/SkeletonLoader';

export const LandingPage: React.FC = () => {
  const { currentSession, isLoading, sessionList } = useSessionStore();

  useEffect(() => {
    // Try to recover a crashed session on mount
    sessionStore.tryRecoverSession().then((recovered) => {
      if (recovered) {
        uiStore.showToast('Session recovered! Resuming where you left off.', 'success');
        uiStore.navigateTo('game');
      }
    });
    // Load recent sessions for quick resume
    sessionStore.loadSessionList(0, 5);
  }, []);

  const handleNewSession = async () => {
    try {
      await sessionStore.createSession();
      uiStore.navigateTo('game');
      uiStore.showToast('New session started. Good luck!', 'success');
    } catch {
      uiStore.showToast('Failed to start session.', 'error');
    }
  };

  const handleResumeSession = () => {
    uiStore.navigateTo('game');
  };

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          GTO Idiot
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Master Texas Hold'em GTO strategy. Play against 5 BOTs, get real-time
          feedback, and track your progress.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="flex flex-col items-center gap-4 mb-12">
        {currentSession ? (
          <>
            <button onClick={handleResumeSession} className="btn-primary text-lg px-8 py-3">
              Resume Session
            </button>
            <p className="text-gray-500 text-sm">
              Hand #{currentSession.handCount + 1} in progress
            </p>
          </>
        ) : (
          <button onClick={handleNewSession} className="btn-primary text-lg px-8 py-3">
            Start New Session
          </button>
        )}
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        <FeatureCard
          icon="🎯"
          title="GTO Reference"
          description="Preflop charts and postflop guides based on simplified GTO strategy."
        />
        <FeatureCard
          icon="🤖"
          title="5 BOT Opponents"
          description="Practice against GTO-based BOTs at a 6-max table."
        />
        <FeatureCard
          icon="📊"
          title="Performance Stats"
          description="Track your GTO conformance, win rate, and biggest leaks."
        />
      </div>

      {/* Recent sessions */}
      {sessionList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
            <button
              onClick={() => uiStore.navigateTo('session-list')}
              className="text-felt-400 hover:text-felt-300 text-sm transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {sessionList.slice(0, 3).map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  sessionStore.loadSession(session.id).then(() => {
                    uiStore.navigateTo(session.status === 'active' ? 'game' : 'review');
                  });
                }}
                className="card w-full text-left hover:border-felt-600 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-medium">
                    {new Date(session.startedAt).toLocaleDateString()} — {session.handCount} hands
                  </p>
                  <p className="text-gray-500 text-xs">
                    GTO: {session.gtoConformance.toFixed(0)}%
                  </p>
                </div>
                <div
                  className={`text-sm font-mono font-semibold ${
                    session.netProfitLossBB >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {session.netProfitLossBB >= 0 ? '+' : ''}
                  {session.netProfitLossBB.toFixed(1)} BB
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {sessionList.length === 0 && !currentSession && (
        <EmptyState
          icon="🎰"
          title="No sessions yet"
          description="Start your first session to begin tracking your GTO progress."
        />
      )}
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="card text-center">
    <span className="text-3xl mb-3 block">{icon}</span>
    <h3 className="text-white font-semibold mb-1">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);
