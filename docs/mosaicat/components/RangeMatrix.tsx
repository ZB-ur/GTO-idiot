import React, { useState, useCallback } from 'react';

export interface GTOAction {
  action: string;
  frequency: number;
}

export interface RangeMatrixCellData {
  handLabel: string;
  row: number;
  col: number;
  isSuited: boolean;
  isPair: boolean;
  actions: GTOAction[];
}

interface RangeMatrixProps {
  cells: RangeMatrixCellData[];
  highlightRow?: number;
  highlightCol?: number;
  onCellClick?: (row: number, col: number) => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const ACTION_COLORS: Record<string, string> = {
  raise: '#34d399',   // emerald-400
  call: '#38bdf8',    // sky-400
  fold: '#6b7280',    // gray-500
  bet: '#34d399',
  all_in: '#fbbf24',  // amber-400
  check: '#38bdf8',
};

const getCellBackground = (actions: GTOAction[]): string => {
  if (!actions.length) return '#1f2937'; // gray-800
  const primary = actions.reduce((a, b) => (a.frequency > b.frequency ? a : b));
  const color = ACTION_COLORS[primary.action] || '#6b7280';
  const opacity = Math.round((primary.frequency / 100) * 0.8 * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${opacity}`;
};

const RangeMatrixLegend: React.FC = () => (
  <div className="flex items-center gap-4 text-xs text-gray-400">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded bg-emerald-400/70" />
      <span>Raise</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded bg-sky-400/70" />
      <span>Call</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded bg-gray-500/70" />
      <span>Fold</span>
    </div>
  </div>
);

export const RangeMatrix: React.FC<RangeMatrixProps> = ({
  cells,
  highlightRow,
  highlightCol,
  onCellClick,
}) => {
  const [tooltip, setTooltip] = useState<{ cell: RangeMatrixCellData; x: number; y: number } | null>(null);

  const getCellData = useCallback(
    (row: number, col: number) => cells.find((c) => c.row === row && c.col === col),
    [cells]
  );

  return (
    <div className="space-y-3">
      <div className="inline-block bg-gray-900 border border-gray-700 rounded-xl p-3 overflow-hidden">
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `repeat(13, 1fr)` }}
        >
          {RANKS.map((_, rowIdx) =>
            RANKS.map((_, colIdx) => {
              const cell = getCellData(rowIdx, colIdx);
              if (!cell) return <div key={`${rowIdx}-${colIdx}`} className="w-9 h-9" />;

              const isHighlighted = highlightRow === rowIdx && highlightCol === colIdx;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`w-9 h-9 flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all rounded-sm ${
                    isHighlighted
                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-900 z-10'
                      : 'hover:ring-1 hover:ring-gray-500'
                  } ${cell.isPair ? 'text-gray-50' : cell.isSuited ? 'text-emerald-300' : 'text-gray-300'}`}
                  style={{ backgroundColor: getCellBackground(cell.actions) }}
                  onClick={() => onCellClick?.(rowIdx, colIdx)}
                  onMouseEnter={(e) =>
                    setTooltip({ cell, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  {cell.handLabel}
                </div>
              );
            })
          )}
        </div>
      </div>

      <RangeMatrixLegend />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
        >
          <div className="text-sm font-bold text-gray-50 mb-1.5">{tooltip.cell.handLabel}</div>
          <div className="space-y-1">
            {tooltip.cell.actions.map((a) => (
              <div key={a.action} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ACTION_COLORS[a.action] || '#6b7280' }}
                />
                <span className="text-gray-400 capitalize">{a.action}</span>
                <span className="text-gray-50 font-medium ml-auto">{a.frequency}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};