import React, { useEffect, useState } from 'react';

interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
  handCount: number;
  netProfitLossBB: number;
  gtoConformance: number;
}

interface StatsSummary {
  totalHands: number;
  totalSessions: number;
  netProfitLossBB: number;
  overallGTOConformance: number;
}

interface LandingPageProps {
  onStartSession: () => void;
  onNavigateToSession: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSession,
  onNavigateToSession,
}) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsRes, statsRes] = await Promise.all([
          fetch('/sessions?limit=5&sortBy=date&sortOrder=desc'),
          fetch('/stats/summary'),
        ]);
        const sessionsData = await sessionsRes.json();
        const statsData = await statsRes.json();
        setSessions(sessionsData.sessions ?? []);
        setStats(statsData);
      } catch {
        // silently handle – empty state will show
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPL = (bb: number) => {
    const sign = bb >= 0 ? '+' : '';
    return `${sign}${bb.toFixed(1)} BB`;
  };

  const plColor = (bb: number) =>
    bb > 0 ? 'text-green-500' : bb < 0 ? 'text-red-500' : 'text-gray-600';

  const conformanceBadge = (pct: number) => {
    if (pct >= 80) return 'bg-green-100 text-green-700';
    if (pct >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400 text-lg">加载中...</div>
      </div>
    );
  }

  const hasSessions = sessions.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Hero / CTA */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">GTO Idiot</h1>
        <p className="text-gray-600 text-lg">
          Texas Hold'em GTO 策略训练器
        </p>
        <button
          onClick={onStartSession}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors shadow-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          开始新会话
        </button>
      </div>

      {/* Summary Cards */}
      {stats && hasSessions && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="总手数"
            value={stats.totalHands.toLocaleString()}
            icon="🃏"
          />
          <SummaryCard
            label="总场次"
            value={stats.totalSessions.toString()}
            icon="📋"
          />
          <SummaryCard
            label="总盈亏"
            value={formatPL(stats.netProfitLossBB)}
            icon="💰"
            valueClass={plColor(stats.netProfitLossBB)}
          />
          <SummaryCard
            label="GTO 符合率"
            value={`${stats.overallGTOConformance.toFixed(1)}%`}
            icon="🎯"
            valueClass={
              stats.overallGTOConformance >= 70
                ? 'text-green-500'
                : 'text-yellow-500'
            }
          />
        </div>
      )}

      {/* Recent Sessions or Empty State */}
      {hasSessions ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">最近会话</h2>
          <div className="space-y-3">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigateToSession(s.id)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">
                    {s.status === 'active' ? '▶️' : '✅'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {formatDate(s.startedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.handCount} 手{' '}
                      {s.status === 'active' && (
                        <span className="text-blue-600 font-medium">
                          · 进行中
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-sm font-semibold ${plColor(s.netProfitLossBB)}`}>
                    {formatPL(s.netProfitLossBB)}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${conformanceBadge(s.gtoConformance)}`}
                  >
                    {s.gtoConformance.toFixed(0)}%
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center space-y-4">
          <div className="text-5xl">🃏</div>
          <h3 className="text-lg font-semibold text-gray-900">
            还没有会话记录
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            开始你的第一局 GTO 训练，追踪你的决策质量，逐步提升策略水平。
          </p>
          <button
            onClick={onStartSession}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            开始第一局
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Sub-components ---------- */

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  valueClass?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  valueClass = 'text-gray-900',
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
    <div className={`text-xl font-bold ${valueClass}`}>{value}</div>
  </div>
);

export default LandingPage;