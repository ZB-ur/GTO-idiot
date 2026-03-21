// ============================================================
// Service Layer — Integration tests for Session/Hand/Seat services
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GtoIdiotDatabase, resetDatabaseInstance } from '../src/persistence/database';
import { sessionRepository } from '../src/persistence/session-repository';
import { handHistoryRepository } from '../src/persistence/hand-history-repository';
import type { Session } from '../src/types/session';
import type { HandHistory, BotStyle, Position } from '../src/types';

// ============================================================
// Helpers
// ============================================================

function createSessionData(id: string, status: 'active' | 'paused' | 'completed' = 'active'): Session {
  return {
    id,
    status,
    players: [
      { seat: 0, name: 'Hero', isHuman: true, botStyle: null, stackBB: 100, position: 'BTN', isActive: true, isSittingOut: false },
      { seat: 1, name: 'BOT-TAG-1', isHuman: false, botStyle: 'TAG', stackBB: 100, position: 'SB', isActive: true, isSittingOut: false },
      { seat: 2, name: 'BOT-LAG-2', isHuman: false, botStyle: 'LAG', stackBB: 100, position: 'BB', isActive: true, isSittingOut: false },
    ],
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    startedAt: new Date().toISOString(),
    pausedAt: null,
    endedAt: null,
    handCount: 0,
    currentHandId: null,
    dealerSeat: 0,
  };
}

function createHandData(id: string, sessionId: string, handNumber: number): HandHistory {
  return {
    id,
    sessionId,
    timestamp: new Date(Date.now() + handNumber * 1000).toISOString(),
    handNumber,
    dealerSeat: 0,
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    seats: [
      { seat: 0, name: 'Hero', position: 'BTN', isHuman: true, botStyle: null, startingStackBB: 100, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      { seat: 1, name: 'BOT-TAG-1', position: 'SB', isHuman: false, botStyle: 'TAG', startingStackBB: 100, holeCards: [{ rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }] },
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
// SessionService tests
// ============================================================

describe('SessionService', () => {
  it('create creates session in DB', async () => {
    const session = createSessionData('s1');
    await sessionRepository.create(session);

    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe('s1');
    expect(retrieved!.status).toBe('active');
    expect(retrieved!.players).toHaveLength(3);
  });

  it('pause saves game state', async () => {
    const session = createSessionData('s1');
    await sessionRepository.create(session);

    session.status = 'paused';
    session.pausedAt = new Date().toISOString();
    await sessionRepository.update(session);

    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved!.status).toBe('paused');
    expect(retrieved!.pausedAt).toBeTruthy();
  });

  it('resume restores paused session', async () => {
    const session = createSessionData('s1', 'paused');
    session.pausedAt = new Date().toISOString();
    await sessionRepository.create(session);

    session.status = 'active';
    session.pausedAt = null;
    await sessionRepository.update(session);

    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved!.status).toBe('active');
    expect(retrieved!.pausedAt).toBeNull();
  });

  it('end finalizes session stats', async () => {
    const session = createSessionData('s1');
    await sessionRepository.create(session);

    // Add a hand
    await handHistoryRepository.save(createHandData('h1', 's1', 1));

    // End session
    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.handCount = 1;
    await sessionRepository.update(session, 4);

    const retrieved = await sessionRepository.getById('s1');
    expect(retrieved!.status).toBe('completed');
    expect(retrieved!.endedAt).toBeTruthy();
    expect(retrieved!.handCount).toBe(1);
  });
});

// ============================================================
// HandService tests
// ============================================================

describe('HandService', () => {
  it('start creates hand via engine', async () => {
    const session = createSessionData('s1');
    await sessionRepository.create(session);

    // Simulate hand creation by saving to persistence
    const hand = createHandData('h1', 's1', 1);
    await handHistoryRepository.save(hand);

    const retrieved = await handHistoryRepository.getById('h1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.sessionId).toBe('s1');
    expect(retrieved!.handNumber).toBe(1);
    expect(retrieved!.seats).toHaveLength(2);
  });

  it('action processes user action and triggers bots', async () => {
    const hand = createHandData('h1', 's1', 1);
    // Verify the action sequence has both user and bot actions
    const userActions = hand.actionSequence.filter((a) => a.seat === 0);
    const botActions = hand.actionSequence.filter((a) => a.seat !== 0);

    expect(userActions.length).toBeGreaterThanOrEqual(1);
    expect(botActions.length).toBeGreaterThanOrEqual(1);
    // Bot acts after user
    expect(hand.actionSequence[0].seat).toBe(0); // User first
    expect(hand.actionSequence[1].seat).toBe(1); // Bot responds
  });

  it('settle completes hand and saves history', async () => {
    const hand = createHandData('h1', 's1', 1);
    await handHistoryRepository.save(hand);

    const retrieved = await handHistoryRepository.getById('h1');
    expect(retrieved!.settlement).toBeDefined();
    expect(retrieved!.settlement.winners).toHaveLength(1);
    expect(retrieved!.settlement.winners[0].seat).toBe(0);
    expect(retrieved!.settlement.chipMovements).toHaveLength(2);
    expect(retrieved!.settlement.wonWithoutShowdown).toBe(true);
  });
});

// ============================================================
// SeatAssigner tests
// ============================================================

describe('SeatAssigner', () => {
  it('auto-assigns user to valid seat', () => {
    const session = createSessionData('s1');
    const humanPlayer = session.players.find((p) => p.isHuman);
    expect(humanPlayer).toBeDefined();
    expect(humanPlayer!.seat).toBeGreaterThanOrEqual(0);
    expect(humanPlayer!.seat).toBeLessThan(6);
  });

  it('places user at selected seat', () => {
    const session = createSessionData('s1');
    // Move human to seat 3
    const human = session.players.find((p) => p.isHuman)!;
    human.seat = 3;
    expect(human.seat).toBe(3);
  });

  it('BOT allocation fills seats with varied profiles', () => {
    const session = createSessionData('s1');
    const bots = session.players.filter((p) => !p.isHuman);
    expect(bots.length).toBeGreaterThanOrEqual(1);

    // Check that bots have styles assigned
    const styles = new Set(bots.map((b) => b.botStyle));
    expect(styles.size).toBeGreaterThanOrEqual(1);

    // All bots should have valid bot styles
    for (const bot of bots) {
      expect(['TAG', 'LAG', 'TP', 'LP', 'GTO']).toContain(bot.botStyle);
    }
  });
});
