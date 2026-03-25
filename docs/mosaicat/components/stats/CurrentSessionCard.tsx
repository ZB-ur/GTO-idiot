import React from 'react';

interface SessionStats {
  gameId: string;
  handsPlayed: number;
  profit: number;
  vpip: number;
  pfr: number;
  winRate: number;
  gtoDeviationScore: number;
}

interface CurrentSessionCardProps {
  stats: SessionStats;
  className?: string;
}

function profitColor(val: number): string {
  return val >= 0 ? 'text-emerald-600' : 'text-red-500';
}

function profitSign(val: number): string {
  return val >= 0 ? '+' : '';
}

function gtoScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function gtoRingColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function gtoTrackColor(): string {
  return '#e5e7eb';
}

export const CurrentSessionCard: React.FC<CurrentSessionCardProps> = ({
  stats,
  className = '',
}) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (stats.gtoDeviationScore / 100) * circumference;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Session</h3>

      <div className="flex items-start gap-6">
        {/* GTO Score Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke={gtoTrackColor()} strokeWidth="6" />
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke={gtoRingColor(stats.gtoDeviationScore)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 44 44)"
            />
            <text x="44" y="40" textAnchor="middle" fill={gtoRingColor(stats.gtoDeviationScore)} fontSize="20" fontWeight="bold">
              {stats.gtoDeviationScore}
            </text>
            <text x="44" y="54" textAnchor="middle" fill="#9ca3af" fontSize="9" fontWeight="500">
              GTO
            </text>
          </svg>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 min-w-0">
          {/* Hands */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Hands</span>
            <span className="text-lg font-bold text-gray-900">{stats.handsPlayed}</span>
          </div>

          {/* P/L */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profit / Loss</span>
            <span className={`text-lg font-bold ${profitColor(stats.profit)}`}>
              {profitSign(stats.profit)}{stats.profit}
            </span>
          </div>

          {/* VPIP */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">VPIP</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{stats.vpip}%</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(stats.vpip, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* PFR */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">PFR</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{stats.pfr}%</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(stats.pfr, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="flex flex-col col-span-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Win Rate</span>
            <span className="text-lg font-bold text-gray-900">{stats.winRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSessionCard;