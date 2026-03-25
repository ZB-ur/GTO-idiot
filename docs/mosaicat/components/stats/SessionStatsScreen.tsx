import React, { useEffect, useState } from 'react';

// --- Child component imports (assumed to exist) ---
import { CurrentSessionCard } from './CurrentSessionCard';
import { OverallStatsCard } from './OverallStatsCard';
import { EmptyStatsIllustration } from './EmptyStatsIllustration';
import { SkeletonCard } from './SkeletonCard';

// --- Types ---
interface SessionStats {
  gameId: string;
  handsPlayed: number;
  profit: number;
  vpip: number;
  pfr: number;
  winRate: number;
  gtoDeviationScore: number;
}

interface DeviationTrendPoint {
  sessionDate: string;
  score: number;
  handsPlayed: number;
}

interface OverallStats {
  totalHands: number;
  totalProfit: number;
  averageGtoScore: number;
  deviationTrend: DeviationTrendPoint[];
}

interface ProgressionHint {
  shouldShow: boolean;
  currentDifficulty: 'fish' | 'regular' | 'gto';
  suggestedDifficulty?: 'fish' | 'regular' | 'gto';
  currentAverageScore: number;
  threshold?: number;
  message?: string;
}

interface SessionStatsScreenProps {
  currentGameId?: string;
}

// --- Service stubs (replace with real service layer calls) ---
async function fetchSessionStats(gameId: string): Promise<SessionStats> {
  // GET /api/games/{gameId}/stats
  const res = await fetch(`/api/games/${gameId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch session stats');
  return res.json();
}

async function fetchOverallStats(): Promise<OverallStats> {
  // GET /api/stats/overall
  const res = await fetch('/api/stats/overall');
  if (!res.ok) throw new Error('Failed to fetch overall stats');
  return res.json();
}

async function fetchProgressionHint(difficulty: string): Promise<ProgressionHint> {
  // GET /api/progression/hint?current_difficulty=...
  const res = await fetch(`/api/progression/hint?current_difficulty=${difficulty}`);
  if (!res.ok) throw new Error('Failed to fetch progression hint');
  return res.json();
}

export const SessionStatsScreen: React.FC<SessionStatsScreenProps> = ({ currentGameId }) => {
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [progressionHint, setProgressionHint] = useState<ProgressionHint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const promises: Promise<void>[] = [];

        // Fetch session stats if we have an active game
        if (currentGameId) {
          promises.push(
            fetchSessionStats(currentGameId).then((data) => {
              if (!cancelled) setSessionStats(data);
            })
          );
        }

        // Always fetch overall stats
        promises.push(
          fetchOverallStats().then((data) => {
            if (!cancelled) setOverallStats(data);
          })
        );

        await Promise.all(promises);

        // Fetch progression hint after we know the stats
        if (currentGameId) {
          try {
            const hint = await fetchProgressionHint('fish'); // default difficulty
            if (!cancelled) setProgressionHint(hint);
          } catch {
            // progression hint is non-critical
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentGameId]);

  const hasNoData = !loading && !sessionStats && overallStats?.totalHands === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Statistics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your performance and GTO deviation over time
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Progression Hint Banner */}
        {progressionHint?.shouldShow && progressionHint.message && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <span className="text-amber-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-amber-800">Ready for a challenge?</p>
              <p className="text-sm text-amber-700 mt-0.5">{progressionHint.message}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty State */}
        {hasNoData && !loading && <EmptyStatsIllustration />}

        {/* Current Session Card */}
        {!loading && sessionStats && (
          <CurrentSessionCard stats={sessionStats} />
        )}

        {/* Overall Stats Card */}
        {!loading && overallStats && overallStats.totalHands > 0 && (
          <OverallStatsCard stats={overallStats} />
        )}
      </div>
    </div>
  );
};

export default SessionStatsScreen;