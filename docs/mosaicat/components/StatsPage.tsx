import React, { useEffect, useState } from 'react';

// ─── Types ───

interface StatsSummary {
  totalHands: number;
  winRate: number;
  totalProfitLoss: number;
  gtoComplianceRate: number;
}

interface ChipTrendDataPoint {
  handNumber: number;
  cumulativeProfitLoss: number;
  handId?: string;
}

interface PositionStat {
  position: string;
  positionDisplayName: string;
  handsPlayed: number;
  winRate: number;
  profitLoss: number;
}

interface StatsPageProps {
  onNavigateToGame: () => void;
}

// ─── Sub-components ───

function StatsSummaryCards({ summary }: { summary: StatsSummary }) {
  const cards = [
    {
      label: '总手数',
      value: summary.totalHands.toLocaleString(),
      icon: '🃏',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '胜率',
      value: `${(summary.winRate * 100).toFixed(1)}%`,
      icon: '🏆',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: '总盈亏',
      value: `${summary.totalProfitLoss >= 0 ? '+' : ''}${summary.totalProfitLoss.toLocaleString()}`,
      icon: summary.totalProfitLoss >= 0 ? '📈' : '📉',
      color: summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600',
      bg: summary.totalProfitLoss >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'GTO 合规率',
      value: `${(summary.gtoComplianceRate * 100).toFixed(1)}%`,
      icon: '🎯',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 shadow-sm"
        >
          <div className={`${card.bg} rounded-lg p-2.5 text-xl`}>{card.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color} mt-0.5`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipTrendChart({ dataPoints }: { dataPoints: ChipTrendDataPoint[] }) {
  if (dataPoints.length === 0) return null;

  const maxVal = Math.max(...dataPoints.map((d) => d.cumulativeProfitLoss), 0);
  const minVal = Math.min(...dataPoints.map((d) => d.cumulativeProfitLoss), 0);
  const range = maxVal - minVal || 1;

  const chartW = 600;
  const chartH = 200;
  const padX = 0;
  const padY = 16;

  const points = dataPoints.map((d, i) => {
    const x = padX + (i / Math.max(dataPoints.length - 1, 1)) * (chartW - padX * 2);
    const y = padY + (1 - (d.cumulativeProfitLoss - minVal) / range) * (chartH - padY * 2);
    return `${x},${y}`;
  });

  const zeroY = padY + (1 - (0 - minVal) / range) * (chartH - padY * 2);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">筹码趋势</h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          preserveAspectRatio="none"
          style={{ minWidth: 320, height: 200 }}
        >
          {/* Zero line */}
          <line
            x1={0}
            y1={zeroY}
            x2={chartW}
            y2={zeroY}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          {/* Area fill */}
          <polygon
            points={`${points[0].split(',')[0]},${zeroY} ${points.join(' ')} ${points[points.length - 1].split(',')[0]},${zeroY}`}
            fill="url(#trendGrad)"
            opacity={0.3}
          />
          {/* Line */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>第 {dataPoints[0].handNumber} 手</span>
        <span>第 {dataPoints[dataPoints.length - 1].handNumber} 手</span>
      </div>
    </div>
  );
}

function PositionStatsTable({ positions }: { positions: PositionStat[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">位置统计</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-100 bg-slate-50">
              <th className="text-left py-3 px-6 font-medium text-gray-500">位置</th>
              <th className="text-right py-3 px-6 font-medium text-gray-500">手数</th>
              <th className="text-right py-3 px-6 font-medium text-gray-500">胜率</th>
              <th className="text-right py-3 px-6 font-medium text-gray-500">盈亏</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.position}
                className="border-t border-gray-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-6 font-medium text-gray-900">
                  {pos.positionDisplayName}
                </td>
                <td className="py-3 px-6 text-right text-gray-600">{pos.handsPlayed}</td>
                <td className="py-3 px-6 text-right text-gray-600">
                  {(pos.winRate * 100).toFixed(1)}%
                </td>
                <td
                  className={`py-3 px-6 text-right font-semibold ${
                    pos.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {pos.profitLoss >= 0 ? '+' : ''}
                  {pos.profitLoss}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyStateView({ onNavigateToGame }: { onNavigateToGame: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无统计数据</h3>
      <p className="text-gray-500 mb-6">完成一些牌局后，你的统计数据将会显示在这里</p>
      <button
        onClick={onNavigateToGame}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
      >
        开始游戏
      </button>
    </div>
  );
}

// ─── Main Component ───

export default function StatsPage({ onNavigateToGame }: StatsPageProps) {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [chipTrend, setChipTrend] = useState<ChipTrendDataPoint[]>([]);
  const [positions, setPositions] = useState<PositionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [summaryRes, trendRes, positionsRes] = await Promise.all([
          fetch('/api/stats/summary'),
          fetch('/api/stats/chip-trend'),
          fetch('/api/stats/positions'),
        ]);

        if (summaryRes.ok) {
          setSummary(await summaryRes.json());
        }
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          setChipTrend(trendData.dataPoints ?? []);
        }
        if (positionsRes.ok) {
          const posData = await positionsRes.json();
          setPositions(posData.positions ?? []);
        }
      } catch {
        // Silently handle — empty state will show
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const isEmpty = !loading && (!summary || summary.totalHands === 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">统计数据</h1>
          <p className="text-gray-500 mt-1">你的 GTO 训练表现总览</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {isEmpty && <EmptyStateView onNavigateToGame={onNavigateToGame} />}

        {!loading && summary && summary.totalHands > 0 && (
          <div className="space-y-6">
            <StatsSummaryCards summary={summary} />
            <ChipTrendChart dataPoints={chipTrend} />
            {positions.length > 0 && <PositionStatsTable positions={positions} />}
          </div>
        )}
      </div>
    </div>
  );
}