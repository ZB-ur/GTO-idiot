// ============================================================
// PotManager tests — contribution tracking, side pot calculation
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { PotManager } from '../../engine/pot-manager';

describe('PotManager', () => {
  let pm: PotManager;

  beforeEach(() => {
    pm = new PotManager();
  });

  describe('basic operations', () => {
    it('should initialize with zero contributions', () => {
      pm.reset([0, 1, 2]);
      expect(pm.getTotalPot()).toBe(0);
      expect(pm.getContribution(0)).toBe(0);
      expect(pm.getContribution(1)).toBe(0);
      expect(pm.getContribution(2)).toBe(0);
    });

    it('should track contributions per seat', () => {
      pm.reset([0, 1, 2]);
      pm.addContribution(0, 10);
      pm.addContribution(1, 20);
      pm.addContribution(2, 30);

      expect(pm.getContribution(0)).toBe(10);
      expect(pm.getContribution(1)).toBe(20);
      expect(pm.getContribution(2)).toBe(30);
      expect(pm.getTotalPot()).toBe(60);
    });

    it('should accumulate multiple contributions from same seat', () => {
      pm.reset([0, 1]);
      pm.addContribution(0, 5);
      pm.addContribution(0, 10);

      expect(pm.getContribution(0)).toBe(15);
    });

    it('should throw for unknown seat', () => {
      pm.reset([0, 1]);
      expect(() => pm.addContribution(99, 10)).toThrow('Unknown seat 99');
    });

    it('should return 0 for unregistered seat getContribution', () => {
      pm.reset([0, 1]);
      expect(pm.getContribution(99)).toBe(0);
    });
  });

  describe('markFolded', () => {
    it('should mark player as folded', () => {
      pm.reset([0, 1, 2]);
      pm.addContribution(0, 10);
      pm.addContribution(1, 10);
      pm.addContribution(2, 10);
      pm.markFolded(0);

      const pots = pm.calculatePots();
      // Folded player should NOT be in eligible seats
      for (const pot of pots) {
        expect(pot.eligibleSeats).not.toContain(0);
      }
    });
  });

  describe('calculatePots - no side pots', () => {
    it('should create a single main pot when no one is all-in', () => {
      pm.reset([0, 1, 2]);
      pm.addContribution(0, 10);
      pm.addContribution(1, 10);
      pm.addContribution(2, 10);

      const pots = pm.calculatePots();
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(30);
      expect(pots[0].eligibleSeats).toEqual([0, 1, 2]);
    });

    it('should exclude folded players from eligibility', () => {
      pm.reset([0, 1, 2, 3]);
      pm.addContribution(0, 10);
      pm.addContribution(1, 10);
      pm.addContribution(2, 10);
      pm.addContribution(3, 10);
      pm.markFolded(1);
      pm.markFolded(3);

      const pots = pm.calculatePots();
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(40);
      expect(pots[0].eligibleSeats).toEqual([0, 2]);
    });
  });

  describe('calculatePots - side pots', () => {
    it('should create side pot when one player is all-in for less', () => {
      pm.reset([0, 1, 2]);
      // Player 0 goes all-in for 5
      pm.addContribution(0, 5);
      pm.markAllIn(0);
      // Players 1 and 2 call for 10 each
      pm.addContribution(1, 10);
      pm.addContribution(2, 10);

      const pots = pm.calculatePots();
      expect(pots.length).toBeGreaterThanOrEqual(2);

      // Main pot: 5 * 3 = 15 (all three eligible)
      expect(pots[0].amount).toBe(15);
      expect(pots[0].eligibleSeats).toContain(0);
      expect(pots[0].eligibleSeats).toContain(1);
      expect(pots[0].eligibleSeats).toContain(2);

      // Side pot: 5 * 2 = 10 (only seats 1, 2)
      expect(pots[1].amount).toBe(10);
      expect(pots[1].eligibleSeats).not.toContain(0);
      expect(pots[1].eligibleSeats).toContain(1);
      expect(pots[1].eligibleSeats).toContain(2);
    });

    it('should handle multiple all-in levels', () => {
      pm.reset([0, 1, 2, 3]);
      // Seat 0: all-in for 5
      pm.addContribution(0, 5);
      pm.markAllIn(0);
      // Seat 1: all-in for 15
      pm.addContribution(1, 15);
      pm.markAllIn(1);
      // Seat 2: calls 20
      pm.addContribution(2, 20);
      // Seat 3: calls 20
      pm.addContribution(3, 20);

      const pots = pm.calculatePots();
      expect(pots.length).toBeGreaterThanOrEqual(3);

      // Verify total pot amount across all pots
      const totalPotAmount = pots.reduce((sum, p) => sum + p.amount, 0);
      expect(totalPotAmount).toBe(60);
    });

    it('should handle folded player who contributed', () => {
      pm.reset([0, 1, 2]);
      pm.addContribution(0, 10);
      pm.markFolded(0); // Folded after contributing
      pm.addContribution(1, 20);
      pm.markAllIn(1);
      pm.addContribution(2, 20);

      const pots = pm.calculatePots();
      // Player 0's contribution goes to the pot but they can't win
      const totalPot = pots.reduce((sum, p) => sum + p.amount, 0);
      expect(totalPot).toBe(50);

      // No pot should list seat 0 as eligible
      for (const pot of pots) {
        expect(pot.eligibleSeats).not.toContain(0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty active players', () => {
      pm.reset([0, 1]);
      pm.addContribution(0, 10);
      pm.addContribution(1, 10);
      pm.markFolded(0);
      pm.markFolded(1);

      const pots = pm.calculatePots();
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(20);
      expect(pots[0].eligibleSeats).toEqual([]);
    });

    it('should handle single player all-in', () => {
      pm.reset([0, 1]);
      pm.addContribution(0, 50);
      pm.markAllIn(0);
      pm.addContribution(1, 50);

      const pots = pm.calculatePots();
      expect(pots).toHaveLength(1);
      expect(pots[0].amount).toBe(100);
      expect(pots[0].eligibleSeats).toEqual([0, 1]);
    });
  });
});
