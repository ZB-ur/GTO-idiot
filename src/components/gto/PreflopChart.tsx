/**
 * PreflopChart — renders the 13×13 preflop hand matrix.
 * Each cell is color-coded by primary action (fold/call/raise/all_in)
 * and shows the hand label. Hovering reveals action frequencies.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Position } from '../../types/poker';
import type { PreflopScenario, PreflopChart as PreflopChartType, PreflopCell } from '../../types/gto';
import { RANKS } from '../../types/index';
import { PositionSelector } from './PositionSelector';
import { ScenarioSelector } from './ScenarioSelector';
import { GTODisclaimerBanner } from './GTODisclaimerBanner';

// ─── Color mapping ──────────────────────────────────────────────────
const ACTION_COLORS: Record<string, string> = {
  raise: 'bg-red-700/80 text-white',
  all_in: 'bg-red-900/90 text-white',
  call: 'bg-green-700/80 text-white',
  fold: 'bg-gray-700/60 text-gray-400',
};

function getCellClasses(cell: PreflopCell): string {
  const primary = cell.primaryAction ?? cell.actions[0]?.action ?? 'fold';
  return ACTION_COLORS[primary] ?? ACTION_COLORS.fold;
}

// ─── Tooltip ────────────────────────────────────────────────────────
const CellTooltip: React.FC<{ cell: PreflopCell }> = ({ cell }) => (
  <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs shadow-xl ring-1 ring-gray-700">
    <p className="mb-1 font-bold text-white">{cell.hand}</p>
    {cell.actions.map((a, i) => (
      <p key={i} className="text-gray-300">
        {a.action}: {(a.frequency * 100).toFixed(0)}%
        {a.sizing ? ` (${a.sizing})` : ''}
      </p>
    ))}
  </div>
);

// ─── Main component ─────────────────────────────────────────────────
interface PreflopChartProps {
  /** If provided, locks position/scenario externally. Otherwise uses internal state. */
  initialPosition?: Position;
  initialScenario?: PreflopScenario;
  className?: string;
}

export const PreflopChart: React.FC<PreflopChartProps> = ({
  initialPosition = 'BTN',
  initialScenario = 'open',
  className = '',
}) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [scenario, setScenario] = useState<PreflopScenario>(initialScenario);
  const [charts, setCharts] = useState<Record<string, PreflopChartType>>({});
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preflop data from static JSON
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/data/preflop-charts.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { charts: Record<string, PreflopChartType> }) => {
        if (!cancelled) {
          setCharts(data.charts ?? {});
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load charts');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const chartKey = `${position}_${scenario}`;
  const chart = charts[chartKey];
  const matrix = chart?.matrix;

  const handleMouseEnter = useCallback((hand: string) => setHoveredCell(hand), []);
  const handleMouseLeave = useCallback(() => setHoveredCell(null), []);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PositionSelector selected={position} onChange={setPosition} />
        <ScenarioSelector selected={scenario} onChange={setScenario} />
      </div>

      {/* Chart grid */}
      {loading && (
        <div className="flex h-64 items-center justify-center text-gray-400">
          Loading preflop charts…
        </div>
      )}

      {error && (
        <div className="flex h-64 items-center justify-center text-red-400">
          Error: {error}
        </div>
      )}

      {!loading && !error && !matrix && (
        <div className="flex h-64 items-center justify-center text-gray-500">
          No data for {position} / {scenario}
        </div>
      )}

      {matrix && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-red-700/80" /> Raise
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-green-700/80" /> Call
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-gray-700/60" /> Fold
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-red-900/90" /> All-In
            </span>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-[auto_repeat(13,minmax(0,1fr))] gap-px">
              {/* Column headers */}
              <div className="h-7 w-7" />
              {RANKS.map((r) => (
                <div
                  key={`col-${r}`}
                  className="flex h-7 w-7 items-center justify-center text-[10px] font-bold text-gray-400 sm:h-9 sm:w-9"
                >
                  {r}
                </div>
              ))}

              {matrix.map((row, ri) => (
                <React.Fragment key={ri}>
                  {/* Row header */}
                  <div className="flex h-7 w-7 items-center justify-center text-[10px] font-bold text-gray-400 sm:h-9 sm:w-9">
                    {RANKS[ri]}
                  </div>

                  {row.map((cell, ci) => {
                    const isHovered = hoveredCell === cell.hand;
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={`relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-[3px] text-[9px] font-medium transition-transform sm:h-9 sm:w-9 sm:text-[10px] ${getCellClasses(cell)} ${isHovered ? 'z-10 scale-125 ring-2 ring-white/60' : ''}`}
                        onMouseEnter={() => handleMouseEnter(cell.hand)}
                        onMouseLeave={handleMouseLeave}
                        title={cell.hand}
                      >
                        {cell.hand}
                        {isHovered && <CellTooltip cell={cell} />}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}

      <GTODisclaimerBanner message={chart?.disclaimer} />
    </div>
  );
};

export default PreflopChart;
