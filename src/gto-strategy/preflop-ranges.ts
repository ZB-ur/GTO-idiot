import type { Position, PreflopScenario, PreflopStrategy, RangeCell } from '../types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

function buildDefaultMatrix(): RangeCell[][] {
  const matrix: RangeCell[][] = [];
  for (let r = 0; r < 13; r++) {
    const row: RangeCell[] = [];
    for (let c = 0; c < 13; c++) {
      const r1 = RANKS[r];
      const r2 = RANKS[c];
      const hand = r === c ? `${r1}${r2}` : r < c ? `${r1}${r2}s` : `${r2}${r1}o`;
      row.push({ hand, action: 'fold', frequency: 0 });
    }
    matrix.push(row);
  }
  return matrix;
}

export function getPreflopStrategy(position: Position, scenario: PreflopScenario): PreflopStrategy {
  return {
    position,
    scenario,
    raiserPosition: null,
    confidenceLevel: 'exact',
    rangeMatrix: buildDefaultMatrix(),
  };
}
