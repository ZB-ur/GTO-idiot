import React from 'react';

// --- Types ---

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface PositionStats {
  position: Position;
  handsPlayed: number;
  deviationRate: number;
  profitLoss: number;
  deviationCount?: number;
  correctCount?: number;
}

export interface SessionStats {
  sessionId: string;
  totalHands: number;
  totalProfitLoss: number;
  deviationCount: number;
  correctCount: number;
  gtoComplianceRate: number;
  positionBreakdown: PositionStats[];
}

interface SessionStatsPanelProps {
  stats: SessionStats;
  onViewHistory: () => void;
}

// --- Sub-components ---

interface StatItemProps {
  label: string;
  value: string | number;
  valueColor?: string;
  subtitle?: string;
}

function StatItem({ label, value, valueColor = 'text-gray-900', subtitle }: StatItemProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
      <span className="text-sm font-medium text-gray-600 mb-1">{label}</span>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
      {subtitle && <span className="text-xs text-gray-400 mt-0.5">{subtitle}</span>}
    </div>
  );
}

interface GtoComplianceGaugeProps {
  rate: number; // 0-1
  correctCount: number;
  deviationCount: number;
}

function GtoComplianceGauge({ rate, correctCount, deviationCount }: GtoComplianceGaugeProps) {
  const percentage = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 54; // radius 54
  const strokeDashoffset = circumference - (rate * circumference);

  const getColor = (pct: number) => {
    if (pct >= 80) return { stroke: '#22c55e', text: 'text-green-500', label: '优秀' };
    if (pct >= 60) return { stroke: '#3b82f6', text: 'text-blue-600', label: '良好' };
    if (pct >= 40) return { stroke: '#f59e0b', text: 'text-amber-500', label: '一般' };
    return { stroke: '#ef4444', text: 'text-red-500', label: '需改进' };
  };

  const color = getColor(percentage);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color.text}`}>{percentage}%</span>
          <span className="text-xs text-gray-400">{color.label}</span>
        </div>
      </div>
      <div className="flex gap-4 mt-3 text-sm">
        <span className="text-green-600 font-medium">✓ {correctCount} 正确</span>
        <span className="text-red-500 font-medium">✗ {deviationCount} 偏差</span>
      </div>
    </div>
  );
}

interface PositionBreakdownTableProps {
  positions: PositionStats[];
}

function PositionBreakdownTable({ positions }: PositionBreakdownTableProps) {
  const formatPL = (pl: number) => {
    if (pl > 0) return `+${pl}`;
    return `${pl}`;
  };

  const plColor = (pl: number) => {
    if (pl > 0) return 'text-green-500 font-semibold';
    if (pl < 0) return 'text-red-500 font-semibold';
    return 'text-gray-400';
  };

  const deviationColor = (rate: number) => {
    if (rate <= 0.15) return 'bg-green-100 text-green-700';
    if (rate <= 0.3) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-gray-600">
            <th className="text-left py-3 px-4 font-semibold">位置</th>
            <th className="text-center py-3 px-4 font-semibold">手数</th>
            <th className="text-center py-3 px-4 font-semibold">偏差率</th>
            <th className="text-right py-3 px-4 font-semibold">盈亏</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {positions.map((pos) => (
            <tr key={pos.position} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-mono font-bold text-gray-900">{pos.position}</td>
              <td className="py-3 px-4 text-center text-gray-600">{pos.handsPlayed}</td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${deviationColor(pos.deviationRate)}`}>
                  {Math.round(pos.deviationRate * 100)}%
                </span>
              </td>
              <td className={`py-3 px-4 text-right font-mono ${plColor(pos.profitLoss)}`}>
                {formatPL(pos.profitLoss)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Component ---

export default function SessionStatsPanel({ stats, onViewHistory }: SessionStatsPanelProps) {
  const formatPL = (pl: number) => {
    if (pl > 0) return `+${pl}`;
    return `${pl}`;
  };

  const plColor = stats.totalProfitLoss > 0
    ? 'text-green-500'
    : stats.totalProfitLoss < 0
      ? 'text-red-500'
      : 'text-gray-400';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">牌局统计</h2>
          <p className="text-sm text-gray-400 mt-0.5 font-mono">
            {stats.sessionId.slice(0, 8)}…
          </p>
        </div>
        <button
          onClick={onViewHistory}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          查看历史
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatItem label="总手数" value={stats.totalHands} subtitle="本次牌局" />
        <StatItem
          label="盈亏"
          value={formatPL(stats.totalProfitLoss)}
          valueColor={plColor}
          subtitle="筹码"
        />
        <StatItem
          label="决策数"
          value={stats.correctCount + stats.deviationCount}
          subtitle={`${stats.correctCount} 正确 / ${stats.deviationCount} 偏差`}
        />
      </div>

      {/* GTO Compliance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">GTO 符合率</h3>
        <GtoComplianceGauge
          rate={stats.gtoComplianceRate}
          correctCount={stats.correctCount}
          deviationCount={stats.deviationCount}
        />
      </div>

      {/* Position Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">位置分布</h3>
        <PositionBreakdownTable positions={stats.positionBreakdown} />
      </div>
    </div>
  );
}