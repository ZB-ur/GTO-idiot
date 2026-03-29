import React, { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────
type HandRange = 'last_100' | 'last_500' | 'all';

interface OverviewStats {
  totalHands: number;
  totalProfitLossBB: number;
  avgEvLossPerHand: number;
  handRange: string;
}

interface FrequencyComparison {
  actionType: string;
  userFrequency: number;
  gtoFrequency: number;
  deviation?: number;
}

interface PositionStat {
  position: string;
  sampleSize: number;
  frequencies: FrequencyComparison[];
}

interface StreetStat {
  street: string;
  sampleSize: number;
  frequencies: FrequencyComparison[];
}

interface ScenarioStat {
  scenario: string;
  label: string;
  sampleSize: number;
  userFrequency: number;
  gtoFrequency: number;
}

interface DrilldownHand {
  handId: string;
  handNumber: number;
  position: string;
  playerAction: string;
  gtoRecommendation: string;
  deviationSeverity: 'none' | 'minor' | 'major';
  evLoss: number;
  createdAt: string;
}

// ── Sub-component Props ────────────────────────────────────────
interface TimeRangeSelectorProps {
  value: HandRange;
  onChange: (range: HandRange) => void;
}

interface OverviewStatsCardsProps {
  stats: OverviewStats | null;
  loading: boolean;
}

interface PositionStatsChartProps {
  data: PositionStat[];
  loading: boolean;
  onPositionClick?: (position: string) => void;
}

interface StreetStatsChartProps {
  data: StreetStat[];
  loading: boolean;
  onStreetClick?: (street: string) => void;
}

interface ScenarioRadarChartProps {
  data: ScenarioStat[];
  loading: boolean;
  onScenarioClick?: (scenario: string) => void;
}

interface DrilldownPanelProps {
  scenario: string | null;
  hands: DrilldownHand[];
  total: number;
  loading: boolean;
  onClose: () => void;
  onHandClick?: (handId: string) => void;
}

interface ExportButtonProps {
  handRange: HandRange;
}

// ── TimeRangeSelector ──────────────────────────────────────────
const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  const options: { value: HandRange; label: string }[] = [
    { value: 'last_100', label: 'Last 100' },
    { value: 'last_500', label: 'Last 500' },
    { value: 'all', label: 'All Hands' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            value === opt.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// ── OverviewStatsCards ─────────────────────────────────────────
const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      label: 'Total Hands',
      value: stats?.totalHands.toLocaleString() ?? '—',
      icon: '🃏',
      color: 'text-gray-900',
    },
    {
      label: 'Profit / Loss',
      value: stats ? `${stats.totalProfitLossBB >= 0 ? '+' : ''}${stats.totalProfitLossBB.toFixed(1)} BB` : '—',
      icon: '💰',
      color: stats && stats.totalProfitLossBB >= 0 ? 'text-emerald-600' : 'text-red-500',
    },
    {
      label: 'Avg EV Loss / Hand',
      value: stats ? `${stats.avgEvLossPerHand.toFixed(2)} BB` : '—',
      icon: '📉',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>{card.icon}</span>
                <span>{card.label}</span>
              </div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// ── PositionStatsChart ─────────────────────────────────────────
const PositionStatsChart: React.FC<PositionStatsChartProps> = ({ data, loading, onPositionClick }) => {
  const maxFreq = 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">By Position</h3>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((pos) => {
            const raiseFreq = pos.frequencies.find((f) => f.actionType === 'raise');
            const userPct = (raiseFreq?.userFrequency ?? 0) * 100;
            const gtoPct = (raiseFreq?.gtoFrequency ?? 0) * 100;

            return (
              <div
                key={pos.position}
                className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => onPositionClick?.(pos.position)}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900 w-10">{pos.position}</span>
                  <span className="text-gray-500 text-xs">{pos.sampleSize} hands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 rounded-full opacity-80"
                      style={{ width: `${(userPct / maxFreq)}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-emerald-500 h-full"
                      style={{ width: `${(gtoPct / maxFreq)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-24 text-right">
                    {userPct.toFixed(0)}% / {gtoPct.toFixed(0)}% GTO
                  </span>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-sm opacity-80" /> You (Raise%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-emerald-500 rounded" /> GTO
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── StreetStatsChart ───────────────────────────────────────────
const StreetStatsChart: React.FC<StreetStatsChartProps> = ({ data, loading, onStreetClick }) => {
  const streetLabels: Record<string, string> = {
    preflop: 'Preflop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">By Street</h3>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((street) => (
            <div
              key={street.street}
              className="cursor-pointer hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors"
              onClick={() => onStreetClick?.(street.street)}
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">
                  {streetLabels[street.street] ?? street.street}
                </span>
                <span className="text-gray-500 text-xs">{street.sampleSize} decisions</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {street.frequencies.map((freq) => {
                  const diff = freq.userFrequency - freq.gtoFrequency;
                  const absDiff = Math.abs(diff);
                  const color =
                    absDiff < 0.05
                      ? 'bg-emerald-100 text-emerald-700'
                      : absDiff < 0.15
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700';

                  return (
                    <div key={freq.actionType} className={`rounded-lg p-2 text-center ${color}`}>
                      <div className="text-xs font-medium capitalize">{freq.actionType}</div>
                      <div className="text-sm font-bold">
                        {(freq.userFrequency * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs opacity-70">
                        GTO {(freq.gtoFrequency * 100).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── ScenarioRadarChart ─────────────────────────────────────────
const ScenarioRadarChart: React.FC<ScenarioRadarChartProps> = ({ data, loading, onScenarioClick }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">By Scenario</h3>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((scenario) => {
            const diff = scenario.userFrequency - scenario.gtoFrequency;
            const absDiff = Math.abs(diff);
            const severity =
              absDiff < 0.05 ? 'none' : absDiff < 0.15 ? 'minor' : 'major';
            const dotColor =
              severity === 'none'
                ? 'bg-emerald-500'
                : severity === 'minor'
                ? 'bg-amber-500'
                : 'bg-red-500';

            return (
              <div
                key={scenario.scenario}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => onScenarioClick?.(scenario.scenario)}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {scenario.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {scenario.sampleSize} hands
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {(scenario.userFrequency * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    GTO {(scenario.gtoFrequency * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" /> &lt;5%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full" /> 5–15%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> &gt;15%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── DrilldownPanel ─────────────────────────────────────────────
const DrilldownPanel: React.FC<DrilldownPanelProps> = ({
  scenario,
  hands,
  total,
  loading,
  onClose,
  onHandClick,
}) => {
  if (!scenario) return null;

  const severityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      none: 'bg-emerald-100 text-emerald-700',
      minor: 'bg-amber-100 text-amber-700',
      major: 'bg-red-100 text-red-700',
    };
    return styles[severity] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-slate-50">
        <div>
          <h3 className="text-base font-semibold text-gray-900 capitalize">
            {scenario.replace(/_/g, ' ')}
          </h3>
          <p className="text-xs text-gray-500">{total} matching hands</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {hands.map((hand) => (
            <div
              key={hand.handId}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onHandClick?.(hand.handId)}
            >
              <span className="text-sm font-mono text-gray-500 w-10">#{hand.handNumber}</span>
              <span className="text-xs font-medium bg-slate-100 text-gray-700 px-2 py-0.5 rounded">
                {hand.position}
              </span>
              <div className="flex-1 text-sm text-gray-700">
                <span className="capitalize">{hand.playerAction}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="text-gray-500 capitalize">{hand.gtoRecommendation}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge(hand.deviationSeverity)}`}>
                {hand.deviationSeverity}
              </span>
              <span className="text-sm font-medium text-red-500 w-16 text-right">
                {hand.evLoss > 0 ? `-${hand.evLoss.toFixed(1)}` : '0.0'} BB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── ExportButton ───────────────────────────────────────────────
const ExportButton: React.FC<ExportButtonProps> = ({ handRange }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handRange,
          includeSections: ['overview', 'by_position', 'by_street', 'by_scenario'],
        }),
      });
      const result = await res.json();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename ?? 'stats-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {exporting ? 'Exporting…' : 'Export Stats'}
    </button>
  );
};

// ── StatsDashboard (main) ──────────────────────────────────────
const StatsDashboard: React.FC = () => {
  const [handRange, setHandRange] = useState<HandRange>('all');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [positionStats, setPositionStats] = useState<PositionStat[]>([]);
  const [streetStats, setStreetStats] = useState<StreetStat[]>([]);
  const [scenarioStats, setScenarioStats] = useState<ScenarioStat[]>([]);
  const [drilldownScenario, setDrilldownScenario] = useState<string | null>(null);
  const [drilldownHands, setDrilldownHands] = useState<DrilldownHand[]>([]);
  const [drilldownTotal, setDrilldownTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const fetchStats = useCallback(async (range: HandRange) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ handRange: range });
      const [overviewRes, posRes, streetRes, scenRes] = await Promise.all([
        fetch(`/api/stats/overview?${params}`),
        fetch(`/api/stats/by-position?${params}`),
        fetch(`/api/stats/by-street?${params}`),
        fetch(`/api/stats/by-scenario?${params}`),
      ]);
      const [overviewData, posData, streetData, scenData] = await Promise.all([
        overviewRes.json(),
        posRes.json(),
        streetRes.json(),
        scenRes.json(),
      ]);
      setOverview(overviewData);
      setPositionStats(posData.positions ?? []);
      setStreetStats(streetData.streets ?? []);
      setScenarioStats(scenData.scenarios ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(handRange);
  }, [handRange, fetchStats]);

  const handleDrilldown = async (scenario: string) => {
    setDrilldownScenario(scenario);
    setDrilldownLoading(true);
    try {
      const params = new URLSearchParams({ handRange, limit: '20', offset: '0' });
      const res = await fetch(`/api/stats/drilldown/${scenario}?${params}`);
      const data = await res.json();
      setDrilldownHands(data.hands ?? []);
      setDrilldownTotal(data.total ?? 0);
    } finally {
      setDrilldownLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your play vs GTO across positions, streets, and scenarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector value={handRange} onChange={setHandRange} />
          <ExportButton handRange={handRange} />
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewStatsCards stats={overview} loading={loading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PositionStatsChart
          data={positionStats}
          loading={loading}
          onPositionClick={(pos) => handleDrilldown(`open_raise`)}
        />
        <StreetStatsChart
          data={streetStats}
          loading={loading}
          onStreetClick={(street) => handleDrilldown(`cbet`)}
        />
      </div>

      {/* Scenario Chart (full width) */}
      <ScenarioRadarChart
        data={scenarioStats}
        loading={loading}
        onScenarioClick={handleDrilldown}
      />

      {/* Drilldown Panel */}
      <DrilldownPanel
        scenario={drilldownScenario}
        hands={drilldownHands}
        total={drilldownTotal}
        loading={drilldownLoading}
        onClose={() => setDrilldownScenario(null)}
      />
    </div>
  );
};

export default StatsDashboard;