import React, { useMemo } from 'react';

interface RangeAction {
  actionType: string;
  frequency: number;
}

interface RangeMatrixCell {
  hand: string;
  row: number;
  col: number;
  handType: 'pair' | 'suited' | 'offsuit';
  inRange: boolean;
  colorIntensity: number;
  actions: RangeAction[];
}

interface RangeChartProps {
  matrix: RangeMatrixCell[];
  selectedPosition: string;
  selectedScenario: string;
  onPositionChange: (position: string) => void;
  onScenarioChange: (scenario: string) => void;
  rangePercentage: number;
}

const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const SCENARIOS = [
  { key: 'open_raise', label: 'Open Raise' },
  { key: 'vs_3bet', label: 'vs 3-Bet' },
  { key: 'vs_4bet', label: 'vs 4-Bet' },
  { key: 'vs_open', label: 'vs Open' },
  { key: 'squeeze', label: 'Squeeze' },
];

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getCellColor(cell: RangeMatrixCell): string {
  if (!cell.inRange) return 'bg-gray-800/50';
  const intensity = cell.colorIntensity;
  if (intensity >= 0.8) return 'bg-emerald-500';
  if (intensity >= 0.6) return 'bg-emerald-600';
  if (intensity >= 0.4) return 'bg-emerald-700';
  if (intensity >= 0.2) return 'bg-emerald-800';
  return 'bg-emerald-900';
}

function getHandLabel(row: number, col: number): string {
  if (row === col) return `${RANKS[row]}${RANKS[col]}`;
  if (row < col) return `${RANKS[row]}${RANKS[col]}s`;
  return `${RANKS[col]}${RANKS[row]}o`;
}

export const RangeChart: React.FC<RangeChartProps> = ({
  matrix,
  selectedPosition,
  selectedScenario,
  onPositionChange,
  onScenarioChange,
  rangePercentage,
}) => {
  const matrixMap = useMemo(() => {
    const map = new Map<string, RangeMatrixCell>();
    matrix.forEach((cell) => map.set(`${cell.row}-${cell.col}`, cell));
    return map;
  }, [matrix]);

  return (
    <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-4 w-full max-w-2xl">
      {/* Position Tabs */}
      <div className="flex gap-1 mb-3">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => onPositionChange(pos)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedPosition === pos
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Scenario Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.key}
            onClick={() => onScenarioChange(sc.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedScenario === sc.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-gray-800/60 text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Range Percentage */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">Range</span>
        <span className="text-emerald-400 font-semibold text-sm">{rangePercentage.toFixed(1)}%</span>
      </div>

      {/* 13×13 Grid */}
      <div className="grid grid-cols-13 gap-[2px]" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        {Array.from({ length: 13 }, (_, row) =>
          Array.from({ length: 13 }, (_, col) => {
            const cell = matrixMap.get(`${row}-${col}`);
            const label = getHandLabel(row, col);
            const colorClass = cell ? getCellColor(cell) : 'bg-gray-800/50';
            const textType = row === col ? 'text-amber-300' : row < col ? 'text-blue-300' : 'text-gray-300';

            return (
              <div
                key={`${row}-${col}`}
                className={`${colorClass} aspect-square flex items-center justify-center rounded-sm cursor-pointer hover:ring-1 hover:ring-emerald-400 transition-all`}
                title={cell ? `${label}: ${cell.inRange ? 'In range' : 'Out of range'}` : label}
              >
                <span className={`text-[9px] sm:text-[10px] font-medium ${textType} leading-none`}>{label}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
          <span>Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-800 inline-block" />
          <span>Marginal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-800/50 inline-block" />
          <span>Fold</span>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="text-amber-300">Pairs</span>
          <span className="text-blue-300">Suited</span>
          <span className="text-gray-300">Offsuit</span>
        </div>
      </div>
    </div>
  );
};

export default RangeChart;