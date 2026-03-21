// ============================================================
// Stats — Unit tests for StatsAggregator
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getStatsOverview, getStatsByPosition, getStatsByStreet, getProfitTrend } from '../src/stats/stats-aggregator';
import { resetDatabaseInstance, GtoIdiotDatabase } from '../src/persistence/database';
import { sessionRepository } from '../src/persistence/session-repository';
import { handHistoryRepository } from '../src/persistence/hand-history-repository';
import type { Session } from '../src/types/session';
import type { HandHistory } from '../src/types';

function makeSession(id: string): Session {
  return { id, status: 'completed', players: [], blinds: { smallBlind: 0.5, bigBlind: 1 }, startedAt: '2024-01-01T00:00:00Z', pausedAt: null, endedAt: '2024-01-01T01:00:00Z', handCount: 5, currentHandId: null, dealerSeat: 0 };
}

function makeHand(id: string, sessionId: string, handNumber: number, position: string, profitBB: number): HandHistory {
  return {
    id, sessionId, timestamp: new Date(Date.now() + handNumber * 1000).toISOString(), handNumber, dealerSeat: 0,
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    seats: [
      { seat: 0, name: 'Hero', position: position as any, isHuman: true, botStyle: null, startingStackBB: 100, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      { seat: 1, name: 'BOT', position: 'BB', isHuman: false, botStyle: 'TAG', startingStackBB: 100, holeCards: [{ rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }] },
    ],
    communityCards: [{ rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 's' }, { rank: 'T', suit: 'c' }, { rank: '5', suit: 'h' }],
    actionSequence: [
      { seat: 0, playerName: 'Hero', action: 'raise', amount: 3, street: 'preflop', potAfter: 4.5, timestamp: '2024-01-01T00:00:01Z' },
      { seat: 1, playerName: 'BOT', action: 'call', amount: 2, street: 'preflop', potAfter: 6, timestamp: '2024-01-01T00:00:02Z' },
      { seat: 0, playerName: 'Hero', action: 'bet', amount: 4, street: 'flop', potAfter: 10, timestamp: '2024-01-01T00:00:03Z' },
      { seat: 1, playerName: 'BOT', action: 'fold', amount: null, street: 'flop', potAfter: 10, timestamp: '2024-01-01T00:00:04Z' },
    ],
    settlement: {
      handId: id, winners: [{ seat: 0, potIndex: 0, amountWonBB: 10, handRank: null }],
      showdownHands: [], chipMovements: [{ seat: 0, changesBB: profitBB }, { seat: 1, changesBB: -profitBB }],
      playerFinalStacks: [{ seat: 0, stackBB: 100 + profitBB }, { seat: 1, stackBB: 100 - profitBB }],
      wonWithoutShowdown: true,
    },
  };
}

let db: GtoIdiotDatabase;

beforeEach(async () => {
  resetDatabaseInstance();
  db = new GtoIdiotDatabase();
  await db.delete();
  resetDatabaseInstance();
});

afterEach(async () => {
  try { await db.delete(); } catch {}
  resetDatabaseInstance();
});

describe('StatsAggregator.getOverview', () => {
  it('returns correct totals', async () => {
    await sessionRepository.create(makeSession('s1'));
    await handHistoryRepository.save(makeHand('h1', 's1', 1, 'BTN', 5));
    await handHistoryRepository.save(makeHand('h2', 's1', 2, 'BB', -3));
    await handHistoryRepository.save(makeHand('h3', 's1', 3, 'UTG', 2));

    const overview = await getStatsOverview();
    expect(overview.totalHands).toBe(3);
    expect(overview.totalSessions).toBe(1);
    expect(overview.cumulativeProfitLossBB).toBeCloseTo(4, 1);
  });

  it('handles zero hands gracefully', async () => {
    const overview = await getStatsOverview();
    expect(overview.totalHands).toBe(0);
    expect(overview.winRate).toBe(0);
    expect(overview.cumulativeProfitLossBB).toBe(0);
  });
});

describe('StatsAggregator.getByPosition', () => {
  it('breaks down per position', async () => {
    await handHistoryRepository.save(makeHand('h1', 's1', 1, 'BTN', 5));
    await handHistoryRepository.save(makeHand('h2', 's1', 2, 'BTN', 3));
    await handHistoryRepository.save(makeHand('h3', 's1', 3, 'UTG', -2));

    const stats = await getStatsByPosition();
    const btnStats = stats.find((s) => s.position === 'BTN');
    expect(btnStats).toBeDefined();
    expect(btnStats!.handCount).toBe(2);

    const utgStats = stats.find((s) => s.position === 'UTG');
    expect(utgStats!.handCount).toBe(1);
  });
});

describe('StatsAggregator.getByStreet', () => {
  it('returns EV data per street', async () => {
    await handHistoryRepository.save(makeHand('h1', 's1', 1, 'BTN', 5));

    const stats = await getStatsByStreet();
    expect(stats).toHaveLength(4);
    const preflopStats = stats.find((s) => s.street === 'preflop');
    expect(preflopStats).toBeDefined();
    expect(preflopStats!.decisionCount).toBeGreaterThanOrEqual(1);
  });
});

describe('StatsAggregator.getProfitTrend', () => {
  it('groups by hand correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await handHistoryRepository.save(makeHand(`h${i}`, 's1', i, 'BTN', i % 2 === 0 ? 3 : -2));
    }

    const trend = await getProfitTrend('hand');
    expect(trend.groupBy).toBe('hand');
    expect(trend.dataPoints.length).toBe(5);
  });

  it('groups by session correctly', async () => {
    await sessionRepository.create(makeSession('s1'));
    await sessionRepository.create(makeSession('s2'));

    const trend = await getProfitTrend('session');
    expect(trend.groupBy).toBe('session');
    expect(trend.dataPoints.length).toBe(2);
  });

  it('respects limit parameter', async () => {
    for (let i = 0; i < 20; i++) {
      await handHistoryRepository.save(makeHand(`h${i}`, 's1', i, 'BTN', 1));
    }

    const trend = await getProfitTrend('hand', 5);
    expect(trend.dataPoints.length).toBeLessThanOrEqual(5);
  });
});
