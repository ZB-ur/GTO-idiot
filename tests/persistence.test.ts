import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabase, closeDatabase, deleteDatabase } from '../src/persistence/database';
import { sessionRepository } from '../src/persistence/session-repository';
import { handRepository } from '../src/persistence/hand-repository';
import { sessionStateRepository } from '../src/persistence/session-state-repository';
import type { Session, SessionState } from '../src/types';
import type { HandHistory } from '../src/types';

function makeSession(id = 'sess-1'): Session {
  return { id, status: 'active', startedAt: new Date().toISOString(), players: [], blinds: { smallBlind: 1, bigBlind: 2 }, handCount: 0, humanPlayerIndex: 0, dealerIndex: 0 };
}
function makeHand(sessionId: string, handNumber: number): HandHistory {
  return { handId: `${sessionId}-h${handNumber}`, sessionId, handNumber, startedAt: new Date().toISOString(), players: [], streets: [], result: { winners: [], potTotal: 0 } };
}

beforeEach(async () => { await deleteDatabase(); });
afterEach(async () => { await closeDatabase(); });

describe('Database Schema', () => {
  it('should create database with correct schema and indexes', async () => {
    const db = await getDatabase();
    expect(db.objectStoreNames).toContain('sessions');
    expect(db.objectStoreNames).toContain('hands');
    expect(db.objectStoreNames).toContain('sessionState');
  });
});

describe('Session CRUD', () => {
  it('should CRUD session records', async () => {
    const s = makeSession('crud-1');
    await sessionRepository.create(s);
    const got = await sessionRepository.getById('crud-1');
    expect(got.id).toBe('crud-1');
    expect(got.status).toBe('active');

    const updated = { ...got, status: 'completed' as const, endedAt: new Date().toISOString() };
    await sessionRepository.update(updated);
    const got2 = await sessionRepository.getById('crud-1');
    expect(got2.status).toBe('completed');

    await sessionRepository.delete('crud-1');
    await expect(sessionRepository.getById('crud-1')).rejects.toBeDefined();
  });
});

describe('Hand Repository', () => {
  it('should save hand record with full action history', async () => {
    await sessionRepository.create(makeSession('hs-1'));
    const h = makeHand('hs-1', 1);
    h.streets = [{ street: 'preflop', actions: [{ playerId: 'human', playerName: 'Player', position: 'UTG', actionType: 'call', street: 'preflop', timestamp: 1 }] }];
    await handRepository.create(h);
    const got = await handRepository.getById(h.handId);
    expect(got.streets).toHaveLength(1);
    expect(got.streets[0].actions[0].actionType).toBe('call');
  });

  it('should query hands by sessionId', async () => {
    await sessionRepository.create(makeSession('qs-1'));
    await handRepository.create(makeHand('qs-1', 1));
    await handRepository.create(makeHand('qs-1', 2));
    const result = await handRepository.listBySession('qs-1');
    expect(result.total).toBe(2);
  });

  it('should query hands by compound index', async () => {
    await sessionRepository.create(makeSession('ci-1'));
    await handRepository.create(makeHand('ci-1', 1));
    await handRepository.create(makeHand('ci-1', 2));
    const h = await handRepository.getBySessionAndNumber('ci-1', 2);
    expect(h.handNumber).toBe(2);
  });
});

describe('Session State', () => {
  it('should save and restore session state for crash recovery', async () => {
    const state: SessionState = { sessionId: 'sr-1', status: 'active', players: [], currentHandState: null };
    await sessionStateRepository.save(state);
    const got = await sessionStateRepository.getBySessionId('sr-1');
    expect(got.sessionId).toBe('sr-1');
    expect(got.status).toBe('active');
  });

  it('should overwrite session state on each save', async () => {
    await sessionStateRepository.save({ sessionId: 'ow-1', status: 'active', players: [], currentHandState: null });
    await sessionStateRepository.save({ sessionId: 'ow-1', status: 'completed', players: [], currentHandState: null });
    const got = await sessionStateRepository.getBySessionId('ow-1');
    expect(got.status).toBe('completed');
  });

  it('should handle concurrent writes gracefully', async () => {
    const writes = Array.from({ length: 10 }, (_, i) =>
      sessionStateRepository.save({ sessionId: 'cw-1', status: 'active', players: [], currentHandState: null })
    );
    await Promise.all(writes);
    const got = await sessionStateRepository.getBySessionId('cw-1');
    expect(got.sessionId).toBe('cw-1');
  });
});
