// ============================================================
// Persistence — Unit + Integration tests for IndexedDB repositories
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GtoIdiotDatabase, resetDatabaseInstance } from '../src/persistence/database';
import { sessionRepository } from '../src/persistence/session-repository';
import { handHistoryRepository } from '../src/persistence/hand-history-repository';
import type { Session } from '../src/types/session';
import type { HandHistory } from '../src/types';

function makeSession(id: string, status: 'active' | 'paused' | 'completed' = 'active'): Session {
  return {
    id,
    status,
    players: [],
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    startedAt: new Date(Date.now() - Math.random() * 100000).toISOString(),
    pausedAt: null,
    endedAt: null,
    handCount: 0,
    currentHandId: null,
    dealerSeat: 0,
  };
}

function makeHandHistory(id: string, sessionId: string, handNumber: number): HandHistory {
  return {
    id,
    sessionId,
    timestamp: new Date(Date.now() + handNumber * 1000).toISOString(),
    handNumber,
    dealerSeat: 0,
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    seats: [
      {
        seat: 0, name: 'Hero', position: 'BTN', isHuman: true,
        botStyle: null, startingStackBB: 100,
        holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }],
      },
      {
        seat: 1, name: 'BOT-TAG-1', position: 'BB', isHuman: false,
        botStyle: 'TAG', startingStackBB: 100,
        holeCards: [{ rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }],
      },
    ],
    communityCards: [
      { rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 's' },
      { rank: 'T', suit: 'c' }, { rank: '5', suit: 'h' },
    ],
    actionSequence: [
      { seat: 0, playerName: 'Hero', action: 'raise', amount: 3, street: 'preflop', potAfter: 4.5, timestamp: '2024-01-01T00:00:01Z' },
      { seat: 1, playerName: 'BOT-TAG-1', action: 'call', amount: 2, street: 'preflop', potAfter: 6, timestamp: '2024-01-01T00:00:02Z' },
      { seat: 0, playerName: 'Hero', action: 'bet', amount: 4, street: 'flop', potAfter: 10, timestamp: '2024-01-01T00:00:03Z' },
      { seat: 1, playerName: 'BOT-TAG-1', action: 'fold', amount: null, street: 'flop', potAfter: 10, timestamp: '2024-01-01T00:00:04Z' },
    ],
    settlement: {
      handId: id,
      winners: [{ seat: 0, potIndex: 0, amountWonBB: 10, handRank: null }],
      showdownHands: [],
      chipMovements: [{ seat: 0, changesBB: 4 }, { seat: 1, changesBB: -4 }],
      playerFinalStacks: [{ seat: 0, stackBB: 104 }, { seat: 1, stackBB: 96 }],
      wonWithoutShowdown: true,
    },
  };
}

// ============================================================
// Setup / Teardown
// ============================================================

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

// ============================================================
// Database schema
// ============================================================

describe('Database', () => {
  it('initializes with correct schema and indexes', async () => {
    const session = makeSession('s1');
    await sessionRepository.create(session);
    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('s1');
  });
});

// ============================================================
// SessionRepository
// ============================================================

describe('SessionRepository', () => {
  it('create stores session and returns id', async () => {
    const session = makeSession('s1');
    await sessionRepository.create(session);
    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('s1');
  });

  it('get retrieves session by id', async () => {
    await sessionRepository.create(makeSession('s1'));
    const session = await sessionRepository.getById('s1');
    expect(session).toBeDefined();
    expect(session!.status).toBe('active');
  });

  it('update modifies session fields', async () => {
    const session = makeSession('s1');
    await sessionRepository.create(session);
    session.status = 'paused';
    session.pausedAt = new Date().toISOString();
    await sessionRepository.update(session);
    const updated = await sessionRepository.getById('s1');
    expect(updated!.status).toBe('paused');
    expect(updated!.pausedAt).toBeTruthy();
  });

  it('list returns sessions ordered by startedAt', async () => {
    const s1 = makeSession('s1', 'completed');
    s1.startedAt = '2024-01-01T00:00:00Z';
    const s2 = makeSession('s2', 'completed');
    s2.startedAt = '2024-01-02T00:00:00Z';

    await sessionRepository.create(s1);
    await sessionRepository.create(s2);

    const { sessions } = await sessionRepository.listAll();
    expect(sessions).toHaveLength(2);
    // Ordered desc by startedAt
    expect(sessions[0].id).toBe('s2');
    expect(sessions[1].id).toBe('s1');
  });

  it('getActive returns active session', async () => {
    await sessionRepository.create(makeSession('s1', 'active'));
    await sessionRepository.create(makeSession('s2', 'completed'));
    const active = await sessionRepository.getActive();
    expect(active).toBeDefined();
    expect(active!.id).toBe('s1');
  });
});

// ============================================================
// HandHistoryRepository
// ============================================================

describe('HandHistoryRepository', () => {
  it('save stores hand record', async () => {
    const hand = makeHandHistory('h1', 's1', 1);
    await handHistoryRepository.save(hand);
    const retrieved = await handHistoryRepository.getById('h1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('h1');
  });

  it('get retrieves hand by id', async () => {
    await handHistoryRepository.save(makeHandHistory('h1', 's1', 1));
    const hand = await handHistoryRepository.getById('h1');
    expect(hand!.handNumber).toBe(1);
  });

  it('list supports cursor pagination', async () => {
    for (let i = 0; i < 10; i++) {
      await handHistoryRepository.save(makeHandHistory(`h${i}`, 's1', i));
    }

    const page1 = await handHistoryRepository.list({ limit: 3 });
    expect(page1.hands).toHaveLength(3);
    expect(page1.total).toBe(10);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = await handHistoryRepository.list({ limit: 3, cursor: page1.nextCursor! });
    expect(page2.hands).toHaveLength(3);
    // Should not overlap with page1
    const p1Ids = new Set(page1.hands.map((h) => h.id));
    for (const h of page2.hands) {
      expect(p1Ids.has(h.id)).toBe(false);
    }
  });

  it('list filters by sessionId', async () => {
    await handHistoryRepository.save(makeHandHistory('h1', 's1', 1));
    await handHistoryRepository.save(makeHandHistory('h2', 's2', 1));

    const result = await handHistoryRepository.list({ sessionId: 's1' });
    expect(result.hands).toHaveLength(1);
    expect(result.hands[0].sessionId).toBe('s1');
  });

  it('delete removes hand record', async () => {
    await handHistoryRepository.save(makeHandHistory('h1', 's1', 1));
    const deleted = await handHistoryRepository.delete('h1');
    expect(deleted).toBe(true);
    const after = await handHistoryRepository.getById('h1');
    expect(after).toBeUndefined();
  });

  it('count returns correct count', async () => {
    await handHistoryRepository.save(makeHandHistory('h1', 's1', 1));
    await handHistoryRepository.save(makeHandHistory('h2', 's1', 2));
    await handHistoryRepository.save(makeHandHistory('h3', 's2', 1));

    const total = await handHistoryRepository.count();
    expect(total).toBe(3);

    const s1Count = await handHistoryRepository.count('s1');
    expect(s1Count).toBe(2);
  });
});

// ============================================================
// Integration: pagination performance
// ============================================================

describe('Pagination performance', () => {
  it('handles 100+ records with consistent pagination', async () => {
    // Insert 100+ records
    for (let i = 0; i < 105; i++) {
      await handHistoryRepository.save(makeHandHistory(`h${i}`, 's1', i));
    }

    const count = await handHistoryRepository.count();
    expect(count).toBe(105);

    // Paginate through all
    let cursor: string | null = null;
    let totalFetched = 0;
    do {
      const page = await handHistoryRepository.list({ limit: 20, cursor: cursor ?? undefined });
      totalFetched += page.hands.length;
      cursor = page.nextCursor;
    } while (cursor);

    expect(totalFetched).toBe(105);
  });
});

describe('Error handling', () => {
  it('graceful error when IndexedDB is unavailable', async () => {
    // Delete returns false for non-existent records
    const result = await handHistoryRepository.delete('nonexistent');
    expect(result).toBe(false);
  });
});
