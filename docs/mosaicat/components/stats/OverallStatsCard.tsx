import React from 'react';
import { DeviationTrendChart } from './DeviationTrendChart';

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

interface OverallStatsCardProps {
  stats: OverallStats;
  className?: string;
}

function profitColor(val: number): string {
  return val >= 0 ? 'text-emerald-600' : 'text-red-500';
}

function profitSign(val: number): string {
  return val >= 0 ? '+' : '';
}

function gtoColor(score: number): string {
  if (score >= 70) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export const OverallStatsCard: React.FC<OverallStatsCardProps> = ({
  stats,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Overall Stats</h3>

      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Hands</span>
          <span className="text-2xl font-bold text-gray-900">{stats.totalHands.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Profit</span>
          <span className={`text-2xl font-bold ${profitColor(stats.totalProfit)}`}>
            {profitSign(stats.totalProfit)}{stats.totalProfit.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg GTO Score</span>
          <span className={`text-2xl font-bold ${gtoColor(stats.averageGtoScore)}`}>
            {stats.averageGtoScore}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Deviation Trend Chart */}
      <DeviationTrendChart data={stats.deviationTrend} />
    </div>
  );
};

export default OverallStatsCard;