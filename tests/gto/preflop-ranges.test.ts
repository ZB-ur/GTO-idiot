import { describe, it, expect } from 'vitest';
import { getPreflopRangeTable, getHandFrequencies, STARTING_HANDS, classifyHoleCards } from '../../src/gto/preflop-ranges';
import type { Position } from '../../src/types';

describe('Preflop Ranges', () => {
  it('should contain entries for all 169 starting hands', () => {
    expect(STARTING_HANDS.length).toBe(169);
    const table = getPreflopRangeTable('UTG', 'open');
    expect(table.ranges.length).toBe(169);
  });

  it('should cover all 6 positions', () => {
    const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of positions) {
      const table = getPreflopRangeTable(pos, 'open');
      expect(table.position).toBe(pos);
      expect(table.ranges.length).toBe(169);
    }
  });

  it('should return range data in <1ms (O(1) lookup)', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getHandFrequencies('AKs', 'BTN', 'open');
    }
    const elapsed = performance.now() - start;
    expect(elapsed / 1000).toBeLessThan(1); // avg < 1ms per call
  });

  it('should have frequencies between 0 and 1', () => {
    const table = getPreflopRangeTable('BTN', 'open');
    for (const entry of table.ranges) {
      const { fold, call, raise } = entry.actions;
      expect(fold).toBeGreaterThanOrEqual(0);
      expect(fold).toBeLessThanOrEqual(1);
      expect(call).toBeGreaterThanOrEqual(0);
      expect(call).toBeLessThanOrEqual(1);
      expect(raise).toBeGreaterThanOrEqual(0);
      expect(raise).toBeLessThanOrEqual(1);
      // Sum should be ~1
      expect(fold + call + raise).toBeCloseTo(1, 1);
    }
  });
});

describe('classifyHoleCards', () => {
  it('should classify suited hands', () => {
    expect(classifyHoleCards('A', 'h', 'K', 'h')).toBe('AKs');
  });
  it('should classify offsuit hands', () => {
    expect(classifyHoleCards('A', 'h', 'K', 'd')).toBe('AKo');
  });
  it('should classify pairs', () => {
    expect(classifyHoleCards('J', 'h', 'J', 'd')).toBe('JJ');
  });
});
