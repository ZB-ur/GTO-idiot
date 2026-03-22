import { describe, it, expect } from 'vitest';
import { PotManager } from '../../src/engine/pot-manager';

describe('PotManager', () => {
  it('should calculate main pot from equal bets', () => {
    const pm = new PotManager();
    pm.calculateSidePots([
      { playerId: 'p1', amount: 100, isAllIn: false },
      { playerId: 'p2', amount: 100, isAllIn: false },
      { playerId: 'p3', amount: 100, isAllIn: false },
    ]);
    expect(pm.getMainPot()).toBe(300);
    expect(pm.getSidePots()).toHaveLength(0);
  });

  it('should create side pot when a player is all-in with less chips', () => {
    const pm = new PotManager();
    pm.calculateSidePots([
      { playerId: 'p1', amount: 50, isAllIn: true },
      { playerId: 'p2', amount: 100, isAllIn: false },
      { playerId: 'p3', amount: 100, isAllIn: false },
    ]);
    expect(pm.getMainPot()).toBe(150);
    expect(pm.getSidePots()).toHaveLength(1);
    expect(pm.getSidePots()[0].eligiblePlayerIds).toContain('p2');
    expect(pm.getSidePots()[0].eligiblePlayerIds).toContain('p3');
    expect(pm.getTotalPot()).toBe(250);
  });

  it('should handle multiple side pots with 3+ all-in players', () => {
    const pm = new PotManager();
    pm.calculateSidePots([
      { playerId: 'p1', amount: 30, isAllIn: true },
      { playerId: 'p2', amount: 60, isAllIn: true },
      { playerId: 'p3', amount: 100, isAllIn: false },
    ]);
    expect(pm.getMainPot()).toBe(90);
    expect(pm.getSidePots().length).toBeGreaterThanOrEqual(1);
    expect(pm.getTotalPot()).toBe(190);
  });

  it('should correctly split pot among tied winners', () => {
    const pm = new PotManager();
    pm.addBet(100);
    pm.addBet(100);
    expect(pm.getTotalPot()).toBe(200);
  });

  it('should handle odd chip distribution in split pots', () => {
    const pm = new PotManager();
    pm.addBet(51);
    pm.addBet(50);
    pm.addBet(50);
    expect(pm.getTotalPot()).toBe(151);
  });
});
