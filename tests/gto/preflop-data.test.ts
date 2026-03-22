import { describe, it, expect, beforeAll } from 'vitest';
import { loadPreflopData, getPreflopData } from '../../src/gto/preflop-data';
import type { PreflopStrategyTable } from '../../src/types';

describe('Preflop Data', () => {
  let data: PreflopStrategyTable;

  beforeAll(async () => {
    data = await loadPreflopData();
  });

  it('should load preflop data successfully', () => {
    expect(data).toBeDefined();
    expect(data.positions).toBeDefined();
    expect(getPreflopData()).not.toBeNull();
  });

  it('should contain strategy for all 169 hand combos', () => {
    const positions = Object.keys(data.positions);
    expect(positions.length).toBeGreaterThan(0);
    const firstPos = positions[0];
    const scenarios = Object.keys(data.positions[firstPos]);
    const rfi = data.positions[firstPos][scenarios[0]];
    expect(rfi.length).toBe(169);
  });

  it('should contain entries for all 6 positions', () => {
    const positions = Object.keys(data.positions);
    expect(positions).toContain('UTG');
    expect(positions).toContain('HJ');
    expect(positions).toContain('CO');
    expect(positions).toContain('BTN');
    expect(positions).toContain('SB');
    expect(positions).toContain('BB');
  });

  it('should have valid action frequencies summing to approximately 1.0', () => {
    const rfi = data.positions['UTG']['RFI'];
    for (const handStrategy of rfi) {
      const sum = handStrategy.actions.reduce((s, a) => s + a.frequency, 0);
      expect(sum).toBeCloseTo(1.0, 1);
    }
  });
});
