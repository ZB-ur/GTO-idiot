/**
 * Feature Acceptance Tests: F-006 hand-history-storage
 * Hand history auto-save and persistence
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { card } from '../setup';

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

describe('F-006: hand-history-storage', () => {
  let saveHandHistory: Function;
  let getHandHistory: Function;
  let listHands: Function;
  let mockDb: Record<string, any>;

  beforeEach(async () => {
    mockDb = {
      hands: new Map(),
      put: vi.fn((store: string, value: any) => {
        mockDb.hands.set(value.handId, value);
        return Promise.resolve();
      }),
      get: vi.fn((store: string, key: string) => {
        return Promise.resolve(mockDb.hands.get(key));
      }),
      getAll: vi.fn(() => {
        return Promise.resolve(Array.from(mockDb.hands.values()));
      }),
    };

    const { openDB } = await import('idb');
    (openDB as any).mockResolvedValue(mockDb);

    const store = await import('../../../src/hand-history/services/hand-store');
    saveHandHistory = store.saveHandHistory;
    getHandHistory = store.getHandHistory;
    listHands = store.listHands;
  });

  it('F-006: should record every player action with type, amount, and timestamp during a hand', async () => {
    const handData = {
      handId: 'hand_001',
      sessionId: 'sess_001',
      handNumber: 1,
      playedAt: new Date().toISOString(),
      blinds: { small: 1, big: 2 },
      players: [],
      communityCards: { flop: null, turn: null, river: null },
      streets: {
        preflop: [
          { playerId: 'user', nickname: '用户', actionType: 'raise', amount: 6, sequenceIndex: 0, potAfter: 9, isUserAction: true },
          { playerId: 'bot_1', nickname: '鲨鱼哥', actionType: 'call', amount: 6, sequenceIndex: 1, potAfter: 15, isUserAction: false },
          { playerId: 'bot_2', nickname: '疯狗', actionType: 'fold', sequenceIndex: 2, potAfter: 15, isUserAction: false },
        ],
      },
      result: { winners: [{ playerId: 'user', nickname: '用户', amount: 15 }], showdown: false },
    };

    await saveHandHistory(handData);

    const retrieved = await getHandHistory('hand_001');
    expect(retrieved).toBeDefined();
    expect(retrieved.streets.preflop).toHaveLength(3);
    expect(retrieved.streets.preflop[0].actionType).toBe('raise');
    expect(retrieved.streets.preflop[0].amount).toBe(6);
  });

  it('F-006: should save complete hand history with all required fields upon hand completion', async () => {
    const completeHand = {
      handId: 'hand_002',
      sessionId: 'sess_001',
      handNumber: 2,
      playedAt: new Date().toISOString(),
      blinds: { small: 1, big: 2 },
      players: [
        { playerId: 'user', nickname: '用户', seatIndex: 0, position: 'BTN', isUser: true, startingChips: 400, endingChips: 412, holeCards: [card('A', 's'), card('K', 'h')] },
      ],
      communityCards: {
        flop: [card('A', 'd'), card('7', 'c'), card('2', 'h')],
        turn: card('K', 'd'),
        river: card('3', 's'),
      },
      streets: {
        preflop: [{ playerId: 'user', nickname: '用户', actionType: 'raise', amount: 6, sequenceIndex: 0, potAfter: 9, isUserAction: true }],
        flop: [{ playerId: 'user', nickname: '用户', actionType: 'bet', amount: 8, sequenceIndex: 3, potAfter: 26, isUserAction: true }],
        turn: null,
        river: null,
      },
      result: { winners: [{ playerId: 'user', nickname: '用户', amount: 26, winningHand: '两对 A和K' }], showdown: true },
    };

    await saveHandHistory(completeHand);

    const retrieved = await getHandHistory('hand_002');
    expect(retrieved.handId).toBe('hand_002');
    expect(retrieved.communityCards.flop).toHaveLength(3);
    expect(retrieved.result.showdown).toBe(true);
  });

  it('F-006: should retrieve previously saved hand history', async () => {
    const hand = {
      handId: 'hand_003',
      sessionId: 'sess_001',
      handNumber: 3,
      playedAt: new Date().toISOString(),
      blinds: { small: 1, big: 2 },
      players: [],
      communityCards: { flop: null, turn: null, river: null },
      streets: { preflop: [] },
      result: { winners: [], showdown: false },
    };

    await saveHandHistory(hand);
    const result = await getHandHistory('hand_003');

    expect(result).toBeDefined();
    expect(result.handId).toBe('hand_003');
  });

  it('F-006: should persist hand histories across multiple sessions', async () => {
    await saveHandHistory({
      handId: 'hand_s1_1', sessionId: 'sess_001', handNumber: 1,
      playedAt: new Date().toISOString(), blinds: { small: 1, big: 2 },
      players: [], communityCards: { flop: null, turn: null, river: null },
      streets: { preflop: [] }, result: { winners: [], showdown: false },
    });

    await saveHandHistory({
      handId: 'hand_s2_1', sessionId: 'sess_002', handNumber: 1,
      playedAt: new Date().toISOString(), blinds: { small: 1, big: 2 },
      players: [], communityCards: { flop: null, turn: null, river: null },
      streets: { preflop: [] }, result: { winners: [], showdown: false },
    });

    const allHands = await listHands({});
    expect(allHands.hands.length).toBeGreaterThanOrEqual(2);
  });
});
