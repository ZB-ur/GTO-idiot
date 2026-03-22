import React, { useState, useCallback } from 'react';

// Types from API spec
interface PreflopAction {
  action: 'fold' | 'call' | 'raise' | 'all_in';
  frequency: number;
  sizing?: string;
}

interface PreflopCell {
  hand: string;
  actions: PreflopAction[];
  primaryAction?: 'fold' | 'call' | 'raise' | 'all_in';
  colorCode?: string;
}

interface PreflopChartData {
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  scenario: 'open' | 'vs_raise' | 'vs_3bet' | 'vs_4bet';
  matrix: PreflopCell[][];
  disclaimer: string;
}

interface PreflopChartProps {
  chart: PreflopChartData;
  onCellClick?: (hand: string) => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const ACTION_COLORS: Record<string, string> = {
  raise: 'bg-red-500',
  all_in: 'bg-red-700',
  call: 'bg-green-500',
  fold: 'bg-gray-300',
};

const ACTION_LABELS: Record<string, string> = {
  raise: 'Raise',
  all_in: 'All-in',
  call: 'Call',
  fold: 'Fold',
};

function getCellBg(cell: PreflopCell): string {
  if (cell.colorCode) {
    return '';
  }
  const primary = cell.primaryAction ?? cell.actions[0]?.action ?? 'fold';
  return ACTION_COLORS[primary] ?? 'bg-gray-300';
}

function getCellStyle(cell: PreflopCell): React.CSSProperties | undefined {
  if (cell.colorCode) {
    return { backgroundColor: cell.colorCode };
  }
  return undefined;
}

function getCellTextColor(cell: PreflopCell): string {
  const primary = cell.primaryAction ?? cell.actions[0]?.action ?? 'fold';
  return primary === 'fold' ? 'text-gray-600' : 'text-white';
}

export const PreflopChart: React.FC<PreflopChartProps> = ({ chart, onCellClick }) => {
  const [hoveredCell, setHoveredCell] = useState<PreflopCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(
    (cell: PreflopCell, e: React.MouseEvent) => {
      setHoveredCell(cell);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const scenarioLabels: Record<string, string> = {
    open: 'Open Raise',
    vs_raise: 'vs Raise',
    vs_3bet: 'vs 3-Bet',
    vs_4bet: 'vs 4-Bet',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Preflop Chart — {chart.position}
          </h3>
          <p className="text-sm text-gray-600">{scenarioLabels[chart.scenario] ?? chart.scenario}</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`inline-block w-3 h-3 rounded ${ACTION_COLORS[key]}`} />
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th className="w-8 h-8" />
              {RANKS.map((r) => (
                <th
                  key={r}
                  className="text-xs font-medium text-gray-500 text-center w-8 h-8 select-none"
                >
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.matrix.map((row, ri) => (
              <tr key={ri}>
                <td className="text-xs font-medium text-gray-500 text-center w-8 h-8 select-none">
                  {RANKS[ri]}
                </td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`
                      w-8 h-8 text-center text-[10px] font-semibold leading-none
                      cursor-pointer select-none border border-white/30 transition-transform
                      hover:scale-110 hover:z-10 hover:shadow-md
                      ${getCellBg(cell)} ${getCellTextColor(cell)}
                      ${ri === ci ? 'ring-1 ring-inset ring-black/10' : ''}
                    `}
                    style={getCellStyle(cell)}
                    onClick={() => onCellClick?.(cell.hand)}
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseLeave={handleMouseLeave}
                    title={cell.hand}
                  >
                    {cell.hand}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          <div className="font-bold mb-1">{hoveredCell.hand}</div>
          {hoveredCell.actions.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${ACTION_COLORS[a.action]}`} />
              <span className="capitalize">{a.action}</span>
              <span className="text-gray-400">{(a.frequency * 100).toFixed(0)}%</span>
              {a.sizing && <span className="text-gray-400">({a.sizing})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-gray-400 text-center">{chart.disclaimer}</p>
    </div>
  );
};

export default PreflopChart;