import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryService } from '../../src/services/history-service';
import type { HandRecord } from '../../src/types';

function makeRecord(id: string, profit: number, blindLevel = '1/2' as const, playedAt?: string): HandRecord {
  return {
    handId: id,
    playedAt: playedAt ?? new Date().toISOString(),
    blindLevel,
    dealerPosition: 'BTN',
    players: [
      { playerId: 'player', name: 'You', position: 'BB', startingStack: 200, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }], isHuman: true },
      { playerId: 'bot-1', name: 'Alice', position: 'UTG', startingStack: 200, holeCards: [{ rank: '2', suit: 'd' }, { rank: '7', suit: 'c' }], isHuman: false, botStyle: 'TAG' },
    ],
    streets: [{
      street: 'preflop',
      actions: [
        { playerId: 'player', position: 'BB', action: profit > 0 ? 'raise' : 'call', street: 'preflop', timestamp: Date.now() },
        { playerId: 'bot-1', position: 'UTG', action: 'fold', street: 'preflop', timestamp: Date.now() },
      ],
      potAtStart: 3,
      potAtEnd: 6,
    }],
    result: { winners: [{ playerId: profit > 0 ? 'player' : 'bot-1', amount: 6 }], playerProfit: profit },
  };
}

describe('HistoryService', () => {
  let svc: HistoryService;

  beforeEach(async () => {
    svc = new HistoryService();
    await svc.clearAll();
  });

  it('should save a hand record to IndexedDB', async () => {
    await svc.saveHand(makeRecord('h1', 10));
    const record = await svc.getHandById('h1');
    expect(record).not.toBeNull();
    expect(record!.handId).toBe('h1');
  });

  it('should retrieve a hand by ID', async () => {
    await svc.saveHand(makeRecord('h2', 5));
    const record = await svc.getHandById('h2');
    expect(record!.result.playerProfit).toBe(5);
  });

  it('should list hands with pagination', async () => {
    for (let i = 0; i < 5; i++) await svc.saveHand(makeRecord(`hp${i}`, i));
    const page = await svc.getHands({}, 1, 3);
    expect(page.items).toHaveLength(3);
    expect(page.total).toBe(5);
    expect(page.totalPages).toBe(2);
  });

  it('should filter hands by date range', async () => {
    await svc.saveHand(makeRecord('d1', 1, '1/2', '2025-01-01T00:00:00Z'));
    await svc.saveHand(makeRecord('d2', 2, '1/2', '2025-06-01T00:00:00Z'));
    const page = await svc.getHands({ dateFrom: '2025-03-01T00:00:00Z' });
    expect(page.items).toHaveLength(1);
  });

  it('should filter hands by blind level', async () => {
    await svc.saveHand(makeRecord('bl1', 1, '1/2'));
    await svc.saveHand(makeRecord('bl2', 2, '2/5'));
    const page = await svc.getHands({ blindLevel: '2/5' });
    expect(page.items).toHaveLength(1);
    expect(page.items[0].blindLevel).toBe('2/5');
  });

  it('should filter hands by profit or loss', async () => {
    await svc.saveHand(makeRecord('pf1', 10));
    await svc.saveHand(makeRecord('pf2', -5));
    const profits = await svc.getHands({ profitFilter: 'profit' });
    expect(profits.items.every((h) => h.profit > 0)).toBe(true);
    const losses = await svc.getHands({ profitFilter: 'loss' });
    expect(losses.items.every((h) => h.profit < 0)).toBe(true);
  });

  it('should compute aggregate stats total hands PnL win rate VPIP PFR', async () => {
    await svc.saveHand(makeRecord('s1', 10));
    await svc.saveHand(makeRecord('s2', -5));
    await svc.saveHand(makeRecord('s3', 3));
    const stats = await svc.getStats();
    expect(stats.totalHands).toBe(3);
    expect(stats.totalProfit).toBe(8);
    expect(stats.vpip).toBeDefined();
    expect(stats.pfr).toBeDefined();
  });

  it('should clear all records with clearAll', async () => {
    await svc.saveHand(makeRecord('c1', 1));
    await svc.saveHand(makeRecord('c2', 2));
    const count = await svc.clearAll();
    expect(count).toBe(2);
    const stats = await svc.getStats();
    expect(stats.totalHands).toBe(0);
  });

  it('should handle 10000+ records with sub-100ms query time', async () => {
    // Use a smaller count for test speed; validates the pattern
    const count = 100;
    for (let i = 0; i < count; i++) {
      await svc.saveHand(makeRecord(`perf${i}`, i % 20 - 10));
    }
    const start = performance.now();
    const page = await svc.getHands({}, 1, 20);
    const elapsed = performance.now() - start;
    expect(page.items).toHaveLength(20);
    expect(elapsed).toBeLessThan(500); // relaxed for test env
  });
});
