// ============================================================
// GTO Idiot — Stats Page
// Dashboard with profit curve, key metrics, position stats,
// and top deviations
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type {
  StatsSummary,
  KeyMetrics,
  ProfitCurveResponse,
  PositionStatsResponse,
} from '../../types';
import {
  getStatsSummary,
  getProfitCurve,
  getPositionStats,
  type StatsFilterOptions,
} from '../../services/stats-service';
import {
  calculateKeyMetrics,
} from '../../services/metrics-calculator';
import { getAllHandRecords } from '../../storage/hand-repository';
import { handsToMetricsInput } from '../../services/stats-service';
import { useUIStore } from '../../stores/ui-store';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfitChart from './ProfitChart';

type HandRange = '100' | '500' | 'all';

const HAND_RANGE_OPTIONS: { value: HandRange; label: string }[] = [
  { value: '100', label: 'Last 100' },
  { value: '500', label: 'Last 500' },
  { value: 'all', label: 'All Hands' },
];

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [handRange, setHandRange] = useState<HandRange>('all');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [profitCurve, setProfitCurve] = useState<ProfitCurveResponse | null>(null);
  const [positionStats, setPositionStats] = useState<PositionStatsResponse | null>(null);
  const addToast = useUIStore((s) => s.addToast);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filterOpts: StatsFilterOptions = { hand_range: handRange };

      const [summaryData, curveData, posData, allHands] = await Promise.all([
        getStatsSummary(filterOpts),
        getProfitCurve(filterOpts),
        getPositionStats(filterOpts),
        getAllHandRecords(),
      ]);

      setSummary(summaryData);
      setProfitCurve(curveData);
      setPositionStats(posData);

      // Calculate key metrics from raw hand data
      const metricsInput = handsToMetricsInput(allHands);
      setMetrics(calculateKeyMetrics(metricsInput));
    } catch (err) {
      console.error('[StatsPage] Failed to load stats:', err);
      addToast({ type: 'error', message: 'Failed to load statistics.' });
    } finally {
      setLoading(false);
    }
  }, [handRange, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" message="Loading statistics..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Statistics</h1>

          <div className="flex gap-1">
            {HAND_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHandRange(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  handRange === opt.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        {summary && <SummaryCards summary={summary} />}

        {/* Profit curve */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-200">Profit Curve</h2>
          <ProfitChart
            dataPoints={profitCurve?.data_points ?? []}
            height={300}
          />
        </div>

        {/* Key metrics */}
        {metrics && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-200">Key Metrics</h2>
            <MetricsGrid metrics={metrics} />
          </div>
        )}

        {/* Position stats */}
        {positionStats && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-200">Position Stats</h2>
            <PositionStatsTable positions={positionStats} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

// ---------- Summary Cards ----------

function SummaryCards({ summary }: { summary: StatsSummary }) {
  const cards = [
    {
      label: 'Total Hands',
      value: summary.total_hands.toString(),
      color: 'text-white',
    },
    {
      label: 'Win Rate',
      value: `${summary.win_rate.toFixed(1)}%`,
      color: summary.win_rate >= 50 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Net Profit',
      value: `${summary.net_profit_bb >= 0 ? '+' : ''}${summary.net_profit_bb.toFixed(1)} BB`,
      color: summary.net_profit_bb >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'BB/100',
      value: summary.bb_per_100.toFixed(1),
      color: summary.bb_per_100 >= 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Sessions',
      value: summary.sessions_count.toString(),
      color: 'text-white',
    },
    {
      label: 'Avg Hands/Session',
      value: summary.avg_hands_per_session.toFixed(0),
      color: 'text-white',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-4"
        >
          <div className="mb-1 text-xs text-gray-500">{card.label}</div>
          <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Metrics Grid ----------

function MetricsGrid({ metrics }: { metrics: KeyMetrics }) {
  const items = [
    { label: 'VPIP', value: `${metrics.vpip.toFixed(1)}%`, tooltip: 'Voluntarily Put $ In Pot' },
    { label: 'PFR', value: `${metrics.pfr.toFixed(1)}%`, tooltip: 'Pre-Flop Raise' },
    { label: '3-Bet', value: `${metrics.three_bet.toFixed(1)}%`, tooltip: '3-Bet Percentage' },
    { label: 'WTSD', value: `${metrics.wtsd.toFixed(1)}%`, tooltip: 'Went To Showdown' },
    { label: 'W$SD', value: `${metrics.won_at_showdown.toFixed(1)}%`, tooltip: 'Won $ at Showdown' },
    { label: 'AF', value: metrics.aggression_factor.toFixed(1), tooltip: 'Aggression Factor' },
    { label: 'C-Bet', value: `${(metrics.cbet_flop ?? 0).toFixed(1)}%`, tooltip: 'Flop C-Bet Rate' },
    { label: 'Fold to C-Bet', value: `${(metrics.fold_to_cbet ?? 0).toFixed(1)}%`, tooltip: 'Fold to Flop C-Bet' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-3"
          title={item.tooltip}
        >
          <div className="mb-1 text-xs text-gray-500">{item.label}</div>
          <div className="text-base font-semibold text-white">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Position Stats Table ----------

function PositionStatsTable({ positions }: { positions: PositionStatsResponse }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/80">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Position</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Hands</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Net Profit</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">BB/100</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">VPIP</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">PFR</th>
          </tr>
        </thead>
        <tbody>
          {positions.positions.map((pos) => {
            const profitColor =
              pos.net_profit_bb > 0
                ? 'text-green-400'
                : pos.net_profit_bb < 0
                  ? 'text-red-400'
                  : 'text-gray-400';

            return (
              <tr
                key={pos.position}
                className="border-b border-gray-700/50 transition hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 font-medium text-white">{pos.position}</td>
                <td className="px-4 py-3 text-right text-gray-300">{pos.hands}</td>
                <td className={`px-4 py-3 text-right font-medium ${profitColor}`}>
                  {pos.net_profit_bb >= 0 ? '+' : ''}{pos.net_profit_bb.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {pos.bb_per_100 != null ? pos.bb_per_100.toFixed(1) : '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {pos.vpip != null ? `${pos.vpip.toFixed(1)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {pos.pfr != null ? `${pos.pfr.toFixed(1)}%` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
