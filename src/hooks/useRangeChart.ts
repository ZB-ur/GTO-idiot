import type { Position, PreflopScenario, RangeCell } from '../types';

export function useRangeChart() {
  return {
    position: 'UTG' as Position,
    setPosition: (_p: Position) => {},
    scenario: 'open_raise' as PreflopScenario,
    setScenario: (_s: PreflopScenario) => {},
    matrix: [] as RangeCell[],
    rangePercentage: 0,
    isLoading: false,
  };
}
