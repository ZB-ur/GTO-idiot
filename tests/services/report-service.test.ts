import { describe, it, expect } from 'vitest';
import { ReportService } from '../../src/services/report-service';
import { HistoryService } from '../../src/services/history-service';
import type { HandRecord } from '../../src/types';

function makeRecord(id: string, profit: number): HandRecord {
  return {
    handId: id, playedAt: new Date().toISOString(), blindLevel: '1/2', dealerPosition: 'BTN',
    players: [
      { playerId: 'player', name: 'You', position: 'BB', startingStack: 200, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }], isHuman: true },
      { playerId: 'bot-1', name: 'Alice', position: 'UTG', startingStack: 200, holeCards: [{ rank: '2', suit: 'd' }, { rank: '7', suit: 'c' }], isHuman: false, botStyle: 'TAG' },
    ],
    streets: [{ street: 'preflop', actions: [
      { playerId: 'player', position: 'BB', action: 'raise', street: 'preflop', timestamp: Date.now() },
      { playerId: 'bot-1', position: 'UTG', action: 'fold', street: 'preflop', timestamp: Date.now() },
    ], potAtStart: 3, potAtEnd: 6 }],
    result: { winners: [{ playerId: 'player', amount: 6 }], playerProfit: profit },
  };
}

describe('ReportService', () => {
  const reportSvc = new ReportService();
  const historySvc = new HistoryService();

  it('should generate compliance report for N recent hands', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 5; i++) await historySvc.saveHand(makeRecord(`rp${i}`, i));
    const report = await reportSvc.generateReport(5);
    expect(report.handsAnalyzed).toBe(5);
  });

  it('should compute overall GTO compliance percentage', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 3; i++) await historySvc.saveHand(makeRecord(`oc${i}`, i));
    const report = await reportSvc.generateReport(3);
    expect(report.overallCompliance).toBeGreaterThanOrEqual(0);
    expect(report.overallCompliance).toBeLessThanOrEqual(1);
  });

  it('should compute per-street compliance breakdown', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 3; i++) await historySvc.saveHand(makeRecord(`ps${i}`, i));
    const report = await reportSvc.generateReport(3);
    expect(Array.isArray(report.byStreet)).toBe(true);
  });

  it('should compute per-decision-type compliance breakdown', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 3; i++) await historySvc.saveHand(makeRecord(`dt${i}`, i));
    const report = await reportSvc.generateReport(3);
    expect(Array.isArray(report.byDecisionType)).toBe(true);
  });

  it('should identify top 5 weakness scenarios', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 10; i++) await historySvc.saveHand(makeRecord(`ws${i}`, i % 3 - 1));
    const report = await reportSvc.generateReport(10);
    expect(report.topWeaknesses.length).toBeLessThanOrEqual(5);
  });

  it('should return weakness-specific hand list via getWeaknessHands', async () => {
    await historySvc.clearAll();
    for (let i = 0; i < 5; i++) await historySvc.saveHand(makeRecord(`wh${i}`, i));
    const report = await reportSvc.generateReport(5);
    if (report.topWeaknesses.length > 0) {
      const hands = await reportSvc.getWeaknessHands(report.topWeaknesses[0].weaknessId);
      expect(hands.items).toBeDefined();
    }
  });

  it('should handle empty history gracefully', async () => {
    await historySvc.clearAll();
    const report = await reportSvc.generateReport(10);
    expect(report.handsAnalyzed).toBe(0);
    expect(report.overallCompliance).toBe(0);
    expect(report.topWeaknesses).toHaveLength(0);
  });
});
