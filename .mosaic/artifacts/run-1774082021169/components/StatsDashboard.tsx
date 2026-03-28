'use client';

import ProfitChart from './ProfitChart';

interface SessionStats {
  totalHands: number;
  winRate: number;
  vpip: number;
  pfr: number;
  threeBetPct: number;
  avgProfit: number;
}

interface ProfitChartData {
  dataPoints: { x: number; y: number; label?: string }[];
}

interface StatsDashboardProps {
  stats: SessionStats;
  chartData: ProfitChartData;
}

interface StatCardData {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

function StatCard({ label, value, subtext, color = 'text-white' }: StatCardData) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      {subtext && <div className="text-gray-500 text-xs mt-0.5">{subtext}</div>}
    </div>
  );
}

export default function StatsDashboard({ stats, chartData }: StatsDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-200">Session Statistics</h2>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Hands Played"
          value={stats.totalHands.toLocaleString()}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          color={stats.winRate > 50 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="VPIP"
          value={`${stats.vpip.toFixed(1)}%`}
          subtext="Voluntarily put in pot"
        />
        <StatCard
          label="PFR"
          value={`${stats.pfr.toFixed(1)}%`}
          subtext="Preflop raise"
        />
        <StatCard
          label="3-Bet %"
          value={`${stats.threeBetPct.toFixed(1)}%`}
        />
      </div>

      {/* Profit chart */}
      <ProfitChart dataPoints={chartData.dataPoints} />
    </div>
  );
}