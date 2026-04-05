import React from 'react';

interface GTOAction {
  action: string;
  frequency: number;
}

interface RangeMatrixCellData {
  handLabel: string;
  row: number;
  col: number;
  isSuited: boolean;
  isPair: boolean;
  actions: GTOAction[];
}

interface RangeMatrixCellProps {
  cell: RangeMatrixCellData;
  isHighlighted: boolean;
  size: number;
}

const actionColorMap: Record<string, string> = {
  raise: '#34d399',   // emerald-400
  call: '#38bdf8',    // sky-400
  fold: '#4b5563',    // gray-600
  bet: '#fbbf24',     // amber-400
  check: '#6ee7b7',   // emerald-300
  all_in: '#f87171',  // red-400
};

const RangeMatrixCell: React.FC<RangeMatrixCellProps> = ({ cell, isHighlighted, size }) => {
  // Dominant action determines cell color
  const dominant = cell.actions.reduce(
    (max, a) => (a.frequency > max.frequency ? a : max),
    { action: 'fold', frequency: 0 },
  );
  const bgColor = actionColorMap[dominant.action] || '#4b5563';
  const opacity = Math.max(0.15, dominant.frequency / 100);

  return (
    <div
      className={`flex items-center justify-center text-[6px] font-medium leading-none ${
        isHighlighted
          ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-950 z-10 rounded-sm'
          : ''
      }`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        opacity: isHighlighted ? 1 : opacity,
        color: isHighlighted ? '#fbbf24' : '#e5e7eb',
      }}
      title={`${cell.handLabel}: ${cell.actions.map((a) => `${a.action} ${a.frequency}%`).join(', ')}`}
    >
      {size >= 18 ? cell.handLabel : ''}
    </div>
  );
};

interface MiniRangeMatrixProps {
  cells: RangeMatrixCellData[];
  highlightRow?: number;
  highlightCol?: number;
  onExpand: () => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const MiniRangeMatrix: React.FC<MiniRangeMatrixProps> = ({
  cells,
  highlightRow,
  highlightCol,
  onExpand,
}) => {
  const cellSize = 20;
  const grid: (RangeMatrixCellData | null)[][] = Array.from({ length: 13 }, () =>
    Array(13).fill(null),
  );

  for (const cell of cells) {
    if (cell.row >= 0 && cell.row < 13 && cell.col >= 0 && cell.col < 13) {
      grid[cell.row][cell.col] = cell;
    }
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-50">Range Matrix</span>
        <button
          onClick={onExpand}
          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Expand
        </button>
      </div>

      {/* Matrix Grid */}
      <div className="inline-grid gap-px bg-gray-800 rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(13, ${cellSize}px)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted = r === highlightRow && c === highlightCol;
            const placeholder: RangeMatrixCellData = {
              handLabel: r === c ? `${RANKS[r]}${RANKS[c]}` : r < c ? `${RANKS[r]}${RANKS[c]}s` : `${RANKS[c]}${RANKS[r]}o`,
              row: r,
              col: c,
              isSuited: r < c,
              isPair: r === c,
              actions: [{ action: 'fold', frequency: 100 }],
            };
            return (
              <RangeMatrixCell
                key={`${r}-${c}`}
                cell={cell || placeholder}
                isHighlighted={isHighlighted}
                size={cellSize}
              />
            );
          }),
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#34d399' }} />
          <span>Raise</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#38bdf8' }} />
          <span>Call</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#4b5563' }} />
          <span>Fold</span>
        </div>
      </div>
    </div>
  );
};

export default MiniRangeMatrix;