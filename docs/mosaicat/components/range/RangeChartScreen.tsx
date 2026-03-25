import React, { useState, useEffect, useCallback } from 'react';

// Types
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type RangeView = 'opening' | 'vs_raise';
type ComboType = 'pair' | 'suited' | 'offsuit';
type PrimaryAction = 'raise' | 'call' | 'fold';

interface RangeCellAction {
  type: PrimaryAction;
  frequency: number;
}

interface RangeCell {
  hand: string;
  handLabel: string;
  comboType: ComboType;
  actions: RangeCellAction[];
  primaryAction?: PrimaryAction;
}

interface RangeChart {
  position: Position;
  view: RangeView;
  grid: RangeCell[][];
  rangeSummary: string;
}

// Sub-component props
interface PositionSelectorProps {
  selected: Position;
  onChange: (pos: Position) => void;
}

interface RangeViewToggleProps {
  selected: RangeView;
  onChange: (view: RangeView) => void;
}

interface RangeGridProps {
  grid: RangeCell[][];
}

interface RangeSummaryProps {
  summary: string;
  position: Position;
  view: RangeView;
}

// Constants
const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const POSITION_LABELS: Record<Position, string> = {
  UTG: 'Under the Gun',
  MP: 'Middle Position',
  CO: 'Cut Off',
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
};

const ACTION_COLORS: Record<PrimaryAction, string> = {
  raise: 'bg-red-500',
  call: 'bg-emerald-500',
  fold: 'bg-gray-300',
};

const ACTION_TEXT_COLORS: Record<PrimaryAction, string> = {
  raise: 'text-white',
  call: 'text-white',
  fold: 'text-gray-500',
};

// PositionSelector
const PositionSelector: React.FC<PositionSelectorProps> = ({ selected, onChange }) => (
  <div className="flex gap-1.5">
    {POSITIONS.map((pos) => (
      <button
        key={pos}
        onClick={() => onChange(pos)}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          selected === pos
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        {pos}
      </button>
    ))}
  </div>
);

// RangeViewToggle
const RangeViewToggle: React.FC<RangeViewToggleProps> = ({ selected, onChange }) => (
  <div className="flex bg-gray-100 rounded-lg p-0.5">
    <button
      onClick={() => onChange('opening')}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
        selected === 'opening'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      Opening
    </button>
    <button
      onClick={() => onChange('vs_raise')}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
        selected === 'vs_raise'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      vs Raise
    </button>
  </div>
);

// RangeGrid
const RangeGrid: React.FC<RangeGridProps> = ({ grid }) => (
  <div className="grid grid-cols-13 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
    {grid.map((row, r) =>
      row.map((cell, c) => {
        const primary = cell.primaryAction || 'fold';
        const raiseFreq = cell.actions.find((a) => a.type === 'raise')?.frequency ?? 0;
        const callFreq = cell.actions.find((a) => a.type === 'call')?.frequency ?? 0;
        const isMixed = raiseFreq > 0 && raiseFreq < 100 && callFreq > 0;

        return (
          <div
            key={`${r}-${c}`}
            className={`relative flex items-center justify-center aspect-square text-xs font-medium cursor-pointer transition-transform hover:scale-105 hover:z-10 ${
              ACTION_COLORS[primary]
            } ${ACTION_TEXT_COLORS[primary]}`}
            title={`${cell.handLabel}\n${cell.actions
              .filter((a) => a.frequency > 0)
              .map((a) => `${a.type}: ${a.frequency}%`)
              .join(', ')}`}
          >
            {isMixed && (
              <div
                className="absolute inset-0 bg-emerald-500"
                style={{ clipPath: `inset(${raiseFreq}% 0 0 0)` }}
              />
            )}
            <span className="relative z-10 text-[10px] sm:text-xs">{cell.hand}</span>
          </div>
        );
      })
    )}
  </div>
);

// SkeletonGrid
const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-13 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
    {Array.from({ length: 169 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
    ))}
  </div>
);

// RangeSummary
const RangeSummaryCard: React.FC<RangeSummaryProps> = ({ summary, position, view }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {POSITION_LABELS[position]} ({position})
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {view === 'opening' ? 'Opening range' : 'Range vs raise'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">{summary}</p>
      </div>
    </div>
    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-red-500" />
        <span className="text-xs text-gray-500">Raise</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-emerald-500" />
        <span className="text-xs text-gray-500">Call</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-gray-300" />
        <span className="text-xs text-gray-500">Fold</span>
      </div>
    </div>
  </div>
);

// Main Screen
const RangeChartScreen: React.FC = () => {
  const [position, setPosition] = useState<Position>('BTN');
  const [view, setView] = useState<RangeView>('opening');
  const [rangeChart, setRangeChart] = useState<RangeChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRange = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In-browser service call: getRangeChart(position, view)
      const response = await fetch(`/api/ranges/${position}?view=${view}`);
      if (!response.ok) {
        throw new Error('Failed to load range data');
      }
      const data: RangeChart = await response.json();
      setRangeChart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [position, view]);

  useEffect(() => {
    fetchRange();
  }, [fetchRange]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Range Charts</h1>
          <p className="text-sm text-gray-500 mt-1">
            GTO preflop ranges by position
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                Position
              </label>
              <PositionSelector selected={position} onChange={setPosition} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                View
              </label>
              <RangeViewToggle selected={view} onChange={setView} />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchRange}
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary */}
        {rangeChart && !loading && (
          <RangeSummaryCard
            summary={rangeChart.rangeSummary}
            position={rangeChart.position}
            view={rangeChart.view}
          />
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : rangeChart ? (
          <RangeGrid grid={rangeChart.grid} />
        ) : null}
      </div>
    </div>
  );
};

export default RangeChartScreen;