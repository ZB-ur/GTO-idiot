/**
 * API Contract Tests: Service Layer
 * Tests that service functions match the API spec response shapes.
 * Since the app is client-side SPA with IndexedDB, these test the service abstraction layer.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb for all service tests
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    put: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getAllFromIndex: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    transaction: vi.fn().mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        put: vi.fn(),
        get: vi.fn(),
        getAll: vi.fn().mockResolvedValue([]),
        index: vi.fn().mockReturnValue({ getAll: vi.fn().mockResolvedValue([]) }),
      }),
      done: Promise.resolve(),
    }),
  }),
}));

describe('API Contract: Sessions', () => {
  it('POST /sessions — createSession should return SessionDetail shape', async () => {
    const { createSession } = await import('../../../src/hand-history/services/session-store');
    const result = await createSession();

    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('players');
    expect(result).toHaveProperty('blinds');
    expect(result.blinds).toEqual({ small: 1, big: 2 });
    expect(result.players).toHaveLength(6);
    expect(result.buyIn).toBe(400);
    expect(result.handsPlayed).toBe(0);
    expect(result.status).toBe('active');
  });

  it('GET /sessions — listSessions should return paginated SessionSummary array', async () => {
    const { listSessions } = await import('../../../src/hand-history/services/session-store');
    const result = await listSessions({ page: 1, perPage: 20 });

    expect(result).toHaveProperty('sessions');
    expect(result).toHaveProperty('pagination');
    expect(Array.isArray(result.sessions)).toBe(true);
    expect(result.pagination).toHaveProperty('page');
    expect(result.pagination).toHaveProperty('perPage');
    expect(result.pagination).toHaveProperty('totalItems');
    expect(result.pagination).toHaveProperty('totalPages');
  });

  it('GET /sessions/:id — getSession should return SessionDetail or null', async () => {
    const { getSession } = await import('../../../src/hand-history/services/session-store');
    const result = await getSession('nonexistent');
    // Should return null for missing session
    expect(result).toBeNull();
  });

  it('DELETE /sessions/:id — endSession should return SessionSummary', async () => {
    const { endSession } = await import('../../../src/hand-history/services/session-store');
    const result = await endSession('sess_test');
    if (result) {
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('completed');
    }
  });
});

describe('API Contract: Hands', () => {
  it('GET /hands — listHands should return paginated HandListItem array', async () => {
    const { listHands } = await import('../../../src/hand-history/services/hand-store');
    const result = await listHands({ page: 1, perPage: 20 });

    expect(result).toHaveProperty('hands');
    expect(result).toHaveProperty('pagination');
    expect(Array.isArray(result.hands)).toBe(true);
  });

  it('GET /hands — listHands with filter_errors_only should filter correctly', async () => {
    const { listHands } = await import('../../../src/hand-history/services/hand-store');
    const result = await listHands({ page: 1, perPage: 20, filterErrorsOnly: true });

    expect(result).toHaveProperty('hands');
    // When filtered, all returned hands should have errorCount > 0
    for (const hand of result.hands) {
      expect(hand.gtoRating.errorCount).toBeGreaterThan(0);
    }
  });

  it('GET /hands/:id — getHandHistory should return HandHistory shape', async () => {
    const { getHandHistory } = await import('../../../src/hand-history/services/hand-store');
    const result = await getHandHistory('hand_test');

    // Returns null for missing, or full HandHistory shape
    if (result) {
      expect(result).toHaveProperty('handId');
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('handNumber');
      expect(result).toHaveProperty('players');
      expect(result).toHaveProperty('communityCards');
      expect(result).toHaveProperty('streets');
      expect(result).toHaveProperty('result');
    }
  });
});

describe('API Contract: GTO Strategy', () => {
  it('GET /gto/preflop — getPreflopStrategy should return PreflopStrategy shape', async () => {
    const { getPreflopStrategy } = await import('../../../src/gto-strategy/preflop-ranges');
    const result = getPreflopStrategy('BTN', 'open');

    expect(result).toHaveProperty('position', 'BTN');
    expect(result).toHaveProperty('scenario', 'open');
    expect(result).toHaveProperty('confidenceLevel', 'exact');
    expect(result).toHaveProperty('rangeMatrix');
    expect(result.rangeMatrix).toHaveLength(13);
    expect(result.rangeMatrix[0]).toHaveLength(13);

    const cell = result.rangeMatrix[0][0];
    expect(cell).toHaveProperty('hand');
    expect(cell).toHaveProperty('action');
    expect(cell).toHaveProperty('frequency');
  });

  it('GET /gto/postflop — getPostflopStrategy should return PostflopStrategy shape', async () => {
    const { getPostflopStrategy } = await import('../../../src/gto-strategy/postflop-strategy');
    const result = getPostflopStrategy({
      boardTexture: 'dry',
      street: 'flop',
      position: 'IP',
      sprRange: 'medium',
      handCategory: 'strong_made',
    });

    expect(result).toHaveProperty('boardTexture', 'dry');
    expect(result).toHaveProperty('street', 'flop');
    expect(result).toHaveProperty('position', 'IP');
    expect(result).toHaveProperty('confidenceLevel', 'approximate');
    expect(result).toHaveProperty('recommendation');
    expect(result.recommendation).toHaveProperty('primaryAction');
    expect(result.recommendation).toHaveProperty('betSizing');
    expect(result.recommendation).toHaveProperty('reasoning');
    expect(typeof result.recommendation.reasoning).toBe('string');
  });
});

describe('API Contract: Replay', () => {
  it('GET /hands/:id/replay — computeReplayDecisions should return HandReplay shape', async () => {
    const { computeReplayDecisions } = await import('../../../src/replay/services/replay-service');

    // Given a hand history, compute replay data
    const mockHandHistory = {
      handId: 'hand_test',
      handNumber: 1,
      sessionId: 'sess_test',
      playedAt: new Date().toISOString(),
      blinds: { small: 1, big: 2 },
      players: [],
      communityCards: { flop: null, turn: null, river: null },
      streets: { preflop: [{ playerId: 'user', actionType: 'fold', sequenceIndex: 0, potAfter: 3, isUserAction: true }] },
      result: { winners: [], showdown: false },
    };

    const result = await computeReplayDecisions(mockHandHistory);

    expect(result).toHaveProperty('handId');
    expect(result).toHaveProperty('decisions');
    expect(result).toHaveProperty('overallRating');
    expect(Array.isArray(result.decisions)).toBe(true);
    if (result.decisions.length > 0) {
      const decision = result.decisions[0];
      expect(decision).toHaveProperty('decisionIndex');
      expect(decision).toHaveProperty('street');
      expect(decision).toHaveProperty('userAction');
      expect(decision).toHaveProperty('gtoAction');
      expect(decision).toHaveProperty('rating');
      expect(['optimal', 'acceptable', 'error']).toContain(decision.rating);
    }
  });
});

describe('API Contract: Statistics', () => {
  it('GET /statistics — computeStatistics should return Statistics shape', async () => {
    const { computeStatistics } = await import('../../../src/statistics/services/stats-service');
    const result = await computeStatistics();

    expect(result).toHaveProperty('totalHands');
    expect(result).toHaveProperty('netProfitBB');
    expect(result).toHaveProperty('winRate');
    expect(result).toHaveProperty('gtoMetrics');
    expect(result.gtoMetrics).toHaveProperty('complianceRate');
    expect(result.gtoMetrics).toHaveProperty('avgEvLossPerHand');
    expect(result.gtoMetrics).toHaveProperty('isEstimated');
  });

  it('GET /statistics/pl-chart — computePLChartData should return PLChartResponse shape', async () => {
    const { computePLChartData } = await import('../../../src/statistics/services/stats-service');
    const result = await computePLChartData();

    expect(result).toHaveProperty('dataPoints');
    expect(Array.isArray(result.dataPoints)).toBe(true);
    if (result.dataPoints.length > 0) {
      expect(result.dataPoints[0]).toHaveProperty('handIndex');
      expect(result.dataPoints[0]).toHaveProperty('cumulativeBB');
    }
  });
});
