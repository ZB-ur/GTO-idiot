import React from 'react';

interface ActionFrequency {
  action: string;
  frequency: number;
}

interface GTOFrequencyDistribution {
  frequencies: ActionFrequency[];
  source: string;
}

interface HeatmapCell {
  hand: string;
  row: number;
  col: number;
  frequencies: GTOFrequencyDistribution;
}

interface RangeHeatmapData {
  position: string;
  scenario: string;
  cells: HeatmapCell[];
  highlightedHand: string;
}

interface RangeHeatmapProps {
  heatmap: RangeHeatmapData;
  highlightedHand: string;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * Determine the primary action frequency for coloring.
 * Returns raise frequency as the main "heat" indicator.
 */
function getRaiseFrequency(freq: GTOFrequencyDistribution): number {
  const raise = freq.frequencies.find(
    (f) => f.action === 'raise' || f.action === 'all_in'
  );
  return raise?.frequency ?? 0;
}

function getCallFrequency(freq: GTOFrequencyDistribution): number {
  const call = freq.frequencies.find((f) => f.action === 'call');
  return call?.frequency ?? 0;
}

function getCellColor(freq: GTOFrequencyDistribution): string {
  const raiseFreq = getRaiseFrequency(freq);
  const callFreq = getCallFrequency(freq);
  const totalAction = raiseFreq + callFreq;

  if (totalAction >= 80) return 'bg-emerald-500';
  if (totalAction >= 60) return 'bg-emerald-600';
  if (totalAction >= 40) return 'bg-emerald-700';
  if (totalAction >= 20) return 'bg-emerald-800';
  if (totalAction >= 10) return 'bg-emerald-900';
  return 'bg-gray-700';
}

function getCellOpacity(freq: GTOFrequencyDistribution): string {
  const raiseFreq = getRaiseFrequency(freq);
  const callFreq = getCallFrequency(freq);
  const totalAction = raiseFreq + callFreq;

  if (totalAction >= 80) return 'opacity-100';
  if (totalAction >= 50) return 'opacity-90';
  if (totalAction >= 20) return 'opacity-70';
  return 'opacity-50';
}

export const RangeHeatmap: React.FC<RangeHeatmapProps> = ({
  heatmap,
  highlightedHand,
}) => {
  // Build a lookup map: "row-col" → cell
  const cellMap = new Map<string, HeatmapCell>();
  for (const cell of heatmap.cells) {
    cellMap.set(`${cell.row}-${cell.col}`, cell);
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-100">
          范围表 — {heatmap.position} {heatmap.scenario}
        </span>
        <span className="text-xs text-amber-400 font-mono">
          {highlightedHand}
        </span>
      </div>

      {/* 13×13 Grid */}
      <div className="grid grid-cols-13 gap-px" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        {RANKS.map((rowRank, row) =>
          RANKS.map((colRank, col) => {
            const cell = cellMap.get(`${row}-${col}`);
            const hand = cell?.hand ?? (
              row === col
                ? `${rowRank}${colRank}`
                : row < col
                  ? `${rowRank}${colRank}s`
                  : `${colRank}${rowRank}o`
            );
            const isHighlighted = hand === highlightedHand;
            const colorClass = cell ? getCellColor(cell.frequencies) : 'bg-gray-700';
            const opacityClass = cell ? getCellOpacity(cell.frequencies) : 'opacity-40';

            return (
              <div
                key={`${row}-${col}`}
                className={`aspect-square flex items-center justify-center text-[9px] font-mono rounded-sm transition-all ${colorClass} ${opacityClass} ${
                  isHighlighted
                    ? 'ring-2 ring-amber-400 z-10 scale-110 !opacity-100'
                    : 'hover:scale-105'
                }`}
                title={
                  cell
                    ? `${hand}: ${cell.frequencies.frequencies.map((f) => `${f.action} ${f.frequency}%`).join(', ')}`
                    : hand
                }
              >
                <span className={`${isHighlighted ? 'text-amber-400 font-bold' : 'text-gray-200'}`}>
                  {hand}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
        <span className="text-xs text-gray-500">弃牌</span>
        <div className="flex gap-px flex-1">
          <div className="h-2 flex-1 rounded-sm bg-gray-700 opacity-50" />
          <div className="h-2 flex-1 rounded-sm bg-emerald-900" />
          <div className="h-2 flex-1 rounded-sm bg-emerald-800" />
          <div className="h-2 flex-1 rounded-sm bg-emerald-700" />
          <div className="h-2 flex-1 rounded-sm bg-emerald-600" />
          <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
        </div>
        <span className="text-xs text-gray-500">行动</span>
      </div>
    </div>
  );
};