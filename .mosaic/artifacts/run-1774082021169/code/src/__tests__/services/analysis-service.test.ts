import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HandRecord, ActionEntry, Position, Street } from '../../types/game';
import { createCard } from '../../engine/utils';

// Mock DB and hand-recorder
vi.mock('../../services/db', () => {
  const mockTable = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    toArray: vi.fn().mockResolvedValue([]),
  };
  return {
    db: {
      hands: { ...mockTable },
      sessions: { ...mockTable },
      settings: { ...mockTable },
    },
  };
});

function makeAction(
  playerId: string,
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in',
  street: Street,
  opts: { amount?: number; position?: Position; potAfterAction?: number } = {},
): ActionEntry {
  return {
    playerId,
    playerName: playerId === 'user-1' ? 'You' : 'Bot',
    position: opts.position ?? 'UTG',
    action,
    amount: opts.amount,
    street,
    potAfterAction: opts.potAfterAction ?? 10,
    timestamp: new Date().toISOString(),
    isUserAction: playerId === 'user-1',
  };
}

function createTestHandRecord(overrides: Partial<HandRecord> = {}): HandRecord {
  return {
    id: 'hand-1',
    gameId: 'game-1',
    handNumber: 1,
    dealerPosition: 'BTN',
    players: [
      {
        playerId: 'user-1',
        name: 'You',
        position: 'UTG',
        startingStack: 100,
        endingStack: 98,
        holeCards: {
          card1: createCard('A', 's'),
          card2: createCard('K', 's'),
        },
        isUser: true,
      },
      {
        playerId: 'bot-1',
        name: 'Bot 1',
        position: 'BB',
        startingStack: 100,
        endingStack: 102,
        holeCards: {
          card1: createCard('Q', 'h'),
          card2: createCard('J', 'h'),
        },
      },
    ],
    communityCards: [
      createCard('T', 's'),
      createCard('9', 's'),
      createCard('2', 'd'),
      createCard('5', 'c'),
      createCard('8', 'h'),
    ],
    actionsByStreet: {
      preflop: [
        // Blind posts
        makeAction('bot-sb', 'raise', 'preflop', { amount: 0.5, position: 'SB', potAfterAction: 0.5 }),
        makeAction('bot-1', 'raise', 'preflop', { amount: 1, position: 'BB', potAfterAction: 1.5 }),
        // User raises
        makeAction('user-1', 'raise', 'preflop', { amount: 3, position: 'UTG', potAfterAction: 4.5 }),
        // Bot calls
        makeAction('bot-1', 'call', 'preflop', { amount: 3, position: 'BB', potAfterAction: 7.5 }),
      ],
      flop: [
        makeAction('user-1', 'raise', 'flop', { amount: 5, position: 'UTG', potAfterAction: 12.5 }),
        makeAction('bot-1', 'call', 'flop', { amount: 5, position: 'BB', potAfterAction: 17.5 }),
      ],
    },
    result: {
      winners: [{ playerId: 'bot-1', playerName: 'Bot 1', amount: 17.5 }],
      finalPot: 17.5,
      userProfit: -8,
      wentToShowdown: true,
    },
    playedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('AnalysisService', () => {
  let analysisService: typeof import('../../services/analysis-service');

  beforeEach(async () => {
    vi.resetModules();

    // Mock hand-recorder to return our test record
    const testRecord = createTestHandRecord();
    vi.doMock('../../services/hand-recorder', () => ({
      recordHand: vi.fn().mockResolvedValue(testRecord),
      getHandRecord: vi.fn().mockResolvedValue(testRecord),
    }));

    analysisService = await import('../../services/analysis-service');
  });

  describe('getHandAnalysis', () => {
    it('should return analysis for a valid hand', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      expect(analysis).toBeDefined();
      expect(analysis!.handId).toBe('hand-1');
    });

    it('should have decision points', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      expect(analysis!.decisionPoints.length).toBeGreaterThanOrEqual(1);
    });

    it('should have an overall score between 0-100', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      expect(analysis!.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis!.overallScore).toBeLessThanOrEqual(100);
    });

    it('should have totalEVLoss as a number', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      expect(typeof analysis!.totalEVLoss).toBe('number');
    });

    it('should include summary text', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      expect(analysis!.summary).toBeTruthy();
      expect(typeof analysis!.summary).toBe('string');
    });

    it('should classify decision quality', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      for (const dp of analysis!.decisionPoints) {
        expect(['good', 'minor_deviation', 'major_deviation']).toContain(dp.quality);
      }
    });

    it('should include GTO recommendations', async () => {
      const analysis = await analysisService.getHandAnalysis('hand-1');
      for (const dp of analysis!.decisionPoints) {
        expect(dp.gtoRecommendations.length).toBeGreaterThanOrEqual(1);
        for (const rec of dp.gtoRecommendations) {
          expect(rec.frequency).toBeGreaterThanOrEqual(0);
          expect(rec.frequency).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should return undefined for non-existent hand', async () => {
      vi.resetModules();
      vi.doMock('../../services/hand-recorder', () => ({
        recordHand: vi.fn().mockResolvedValue(undefined),
        getHandRecord: vi.fn().mockResolvedValue(undefined),
      }));

      const freshModule = await import('../../services/analysis-service');
      const analysis = await freshModule.getHandAnalysis('nonexistent');
      expect(analysis).toBeUndefined();
    });
  });

  describe('getHandLeaks', () => {
    it('should return leak analysis', async () => {
      const leaks = await analysisService.getHandLeaks('hand-1');
      expect(leaks).toBeDefined();
      expect(leaks!.handId).toBe('hand-1');
      expect(Array.isArray(leaks!.leaks)).toBe(true);
    });

    it('should have at most 5 leaks', async () => {
      const leaks = await analysisService.getHandLeaks('hand-1');
      expect(leaks!.leaks.length).toBeLessThanOrEqual(5);
    });

    it('should sort leaks by EV loss descending', async () => {
      const leaks = await analysisService.getHandLeaks('hand-1');
      const evLosses = leaks!.leaks.map(l => l.evLoss);
      for (let i = 1; i < evLosses.length; i++) {
        expect(evLosses[i]!).toBeLessThanOrEqual(evLosses[i - 1]!);
      }
    });

    it('should include suggestion for each leak', async () => {
      const leaks = await analysisService.getHandLeaks('hand-1');
      for (const leak of leaks!.leaks) {
        expect(leak.suggestion).toBeTruthy();
        expect(leak.leakType).toBeTruthy();
        expect(leak.description).toBeTruthy();
      }
    });
  });
});
