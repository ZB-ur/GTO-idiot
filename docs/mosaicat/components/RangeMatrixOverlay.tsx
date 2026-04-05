import React, { useCallback, useEffect } from 'react';

interface GTOAction {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  frequency: number;
}

interface RangeMatrixCell {
  handLabel: string;
  row: number;
  col: number;
  isSuited: boolean;
  isPair: boolean;
  actions: GTOAction[];
}

interface RangeMatrixOverlayProps {
  open: boolean;
  cells: RangeMatrixCell[];
  highlightRow?: number;
  highlightCol?: number;
  onClose: () => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getCellColor(actions: GTOAction[]): string {
  if (!actions || actions.length === 0) return 'bg-gray-800';

  const raise = actions.find(a => a.action === 'raise' || a.action === 'bet' || a.action === 'all_in');
  const call = actions.find(a => a.action === 'call' || a.action === 'check');
  const fold = actions.find(a => a.action === 'fold');

  const raiseFreq = raise?.frequency ?? 0;
  const callFreq = call?.frequency ?? 0;
  const foldFreq = fold?.frequency ?? 0;

  if (raiseFreq >= 70) return 'bg-red-500/80';
  if (raiseFreq >= 40) return 'bg-red-500/50';
  if (callFreq >= 70) return 'bg-emerald-500/80';
  if (callFreq >= 40) return 'bg-emerald-500/50';
  if (foldFreq >= 70) return 'bg-gray-700';
  if (raiseFreq > callFreq && raiseFreq > foldFreq) return 'bg-red-500/40';
  if (callFreq > foldFreq) return 'bg-emerald-500/40';
  return 'bg-gray-700';
}

function MatrixCell({
  cell,
  isHighlighted,
}: {
  cell: RangeMatrixCell | undefined;
  isHighlighted: boolean;
}) {
  if (!cell) {
    return <div className="aspect-square bg-gray-800 rounded-sm" />;
  }

  const colorClass = getCellColor(cell.actions);
  const highlightRing = isHighlighted ? 'ring-2 ring-yellow-500 ring-offset-1 ring-offset-gray-950 z-10' : '';

  return (
    <div
      className={`aspect-square ${colorClass} ${highlightRing} rounded-sm flex items-center justify-center cursor-default transition-all`}
      title={cell.actions.map(a => `${a.action}: ${a.frequency}%`).join(', ')}
    >
      <span className="text-[9px] sm:text-[10px] font-medium text-gray-50 leading-none select-none">
        {cell.handLabel}
      </span>
    </div>
  );
}

export function RangeMatrixOverlay({
  open,
  cells,
  highlightRow,
  highlightCol,
  onClose,
}: RangeMatrixOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  // Build a lookup map
  const cellMap = new Map<string, RangeMatrixCell>();
  for (const cell of cells) {
    cellMap.set(`${cell.row}-${cell.col}`, cell);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[95vw] max-w-[600px] bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-50">Range Matrix</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500/80" />
            <span>Raise</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
            <span>Call</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-700" />
            <span>Fold</span>
          </div>
          {highlightRow !== undefined && highlightCol !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm ring-2 ring-yellow-500 bg-gray-600" />
              <span>Your Hand</span>
            </div>
          )}
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-13 gap-[2px]" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {RANKS.map((_, rowIdx) =>
            RANKS.map((_, colIdx) => {
              const cell = cellMap.get(`${rowIdx}-${colIdx}`);
              const isHighlighted =
                highlightRow !== undefined &&
                highlightCol !== undefined &&
                rowIdx === highlightRow &&
                colIdx === highlightCol;

              return (
                <MatrixCell
                  key={`${rowIdx}-${colIdx}`}
                  cell={cell}
                  isHighlighted={isHighlighted}
                />
              );
            }),
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  );
}

export default RangeMatrixOverlay;