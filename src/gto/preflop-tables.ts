/**
 * Preflop GTO lookup tables.
 * Loads simplified JSON data and converts to full PreflopChart (13×13 matrix) format.
 */
import type {
  Position,
  PreflopScenario,
  PreflopChart,
  PreflopCell,
  PreflopAction,
  AllPreflopCharts,
} from '../types';
import { RANKS } from '../types';

/** Raw JSON shape from public/data/preflop-charts.json */
interface RawPreflopEntry {
  position: Position;
  scenario: PreflopScenario;
  raises: string[];
  calls: string[];
  folds: string;
  sizing?: string;
}

type RawPreflopData = Record<string, RawPreflopEntry>;

// Color codes for display
const ACTION_COLORS: Record<PreflopAction, string> = {
  raise: '#e74c3c',
  call: '#2ecc71',
  fold: '#95a5a6',
  all_in: '#9b59b6',
};

let cachedData: RawPreflopData | null = null;
let cachedCharts: AllPreflopCharts | null = null;

/**
 * Build the hand notation for a cell in the 13×13 matrix.
 * Row index = first rank, Col index = second rank (both A-high to 2-low).
 * Upper-right triangle = suited, lower-left = offsuit, diagonal = pairs.
 */
function getHandNotation(rowIdx: number, colIdx: number): string {
  const r1 = RANKS[rowIdx]; // e.g., 'A'
  const r2 = RANKS[colIdx]; // e.g., 'K'
  if (rowIdx === colIdx) return `${r1}${r2}`;       // pair
  if (colIdx < rowIdx) return `${r2}${r1}s`;        // suited (upper-right)
  return `${r1}${r2}o`;                              // offsuit (lower-left)
}

/**
 * Determine the primary action for a hand based on the raw entry lists.
 */
function resolveAction(
  hand: string,
  entry: RawPreflopEntry
): { actions: Array<{ action: PreflopAction; frequency: number; sizing?: string }>; primaryAction: PreflopAction } {
  if (entry.raises.includes(hand)) {
    return {
      actions: [{ action: 'raise', frequency: 1.0, sizing: entry.sizing }],
      primaryAction: 'raise',
    };
  }
  if (entry.calls.includes(hand)) {
    return {
      actions: [{ action: 'call', frequency: 1.0 }],
      primaryAction: 'call',
    };
  }
  return {
    actions: [{ action: 'fold', frequency: 1.0 }],
    primaryAction: 'fold',
  };
}

/**
 * Convert a raw entry into a full 13×13 PreflopChart.
 */
function buildChart(entry: RawPreflopEntry): PreflopChart {
  const matrix: PreflopCell[][] = [];

  for (let row = 0; row < 13; row++) {
    const rowCells: PreflopCell[] = [];
    for (let col = 0; col < 13; col++) {
      const hand = getHandNotation(row, col);
      const { actions, primaryAction } = resolveAction(hand, entry);
      rowCells.push({
        hand,
        actions,
        primaryAction,
        colorCode: ACTION_COLORS[primaryAction],
      });
    }
    matrix.push(rowCells);
  }

  return {
    position: entry.position,
    scenario: entry.scenario,
    matrix,
    disclaimer: '简化 GTO 参考，仅供学习使用',
  };
}

/**
 * Load the raw preflop data from JSON.
 */
async function loadRawData(): Promise<RawPreflopData> {
  if (cachedData) return cachedData;

  const response = await fetch('/data/preflop-charts.json');
  if (!response.ok) {
    throw new Error(`Failed to load preflop charts: ${response.status}`);
  }
  cachedData = (await response.json()) as RawPreflopData;
  return cachedData;
}

/**
 * Get a single preflop chart for a position and scenario.
 */
export async function getPreflopChart(
  position: Position,
  scenario: PreflopScenario
): Promise<PreflopChart | null> {
  const data = await loadRawData();
  const key = `${position}_${scenario}`;
  const entry = data[key];
  if (!entry) return null;
  return buildChart(entry);
}

/**
 * Load all preflop charts at once (for caching).
 */
export async function getAllPreflopCharts(): Promise<AllPreflopCharts> {
  if (cachedCharts) return cachedCharts;

  const data = await loadRawData();
  const charts: Record<string, PreflopChart> = {};

  for (const [key, entry] of Object.entries(data)) {
    charts[key] = buildChart(entry);
  }

  cachedCharts = { charts };
  return cachedCharts;
}

/**
 * Look up the GTO recommended action for a specific hand in a preflop scenario.
 * @param hand - Hand notation like "AKs", "QJo", "TT"
 * @param position - Player position
 * @param scenario - Preflop scenario
 * @returns The primary action or null if chart not found
 */
export async function lookupPreflopAction(
  hand: string,
  position: Position,
  scenario: PreflopScenario
): Promise<{ action: PreflopAction; sizing?: string } | null> {
  const data = await loadRawData();
  const key = `${position}_${scenario}`;
  const entry = data[key];
  if (!entry) return null;

  if (entry.raises.includes(hand)) {
    return { action: 'raise', sizing: entry.sizing };
  }
  if (entry.calls.includes(hand)) {
    return { action: 'call' };
  }
  return { action: 'fold' };
}

/**
 * Get all available chart keys (position_scenario combinations).
 */
export async function getAvailableChartKeys(): Promise<string[]> {
  const data = await loadRawData();
  return Object.keys(data);
}

/**
 * Clear cached data (useful for testing).
 */
export function clearPreflopCache(): void {
  cachedData = null;
  cachedCharts = null;
}
