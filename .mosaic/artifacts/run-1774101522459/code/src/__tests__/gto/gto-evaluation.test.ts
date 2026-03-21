// ============================================================
// GTO Evaluation tests — postflop heuristic & GTO client
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { evaluatePostflop, type PostflopContext } from '../../gto/postflop-heuristic';
import { GTOClient } from '../../gto/gto-client';
import type { Card, GTOEvaluationRequest } from '../../types';

function makePostflopContext(overrides: Partial<PostflopContext> = {}): PostflopContext {
  return {
    holeCards: [
      { rank: 'A', suit: 's' },
      { rank: 'K', suit: 'h' },
    ] as [Card, Card],
    communityCards: [
      { rank: 'A', suit: 'h' },
      { rank: '7', suit: 'd' },
      { rank: '2', suit: 'c' },
    ],
    position: 'BTN',
    potBB: 6,
    stackBB: 97,
    street: 'flop',
    activePlayers: 3,
    actionHistory: [],
    ...overrides,
  };
}

describe('evaluatePostflop', () => {
  it('should return a valid GTOEvaluationResult', () => {
    const ctx = makePostflopContext();
    const result = evaluatePostflop(ctx);

    expect(result.actions).toBeDefined();
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeTruthy();
    expect(typeof result.handStrength).toBe('number');
    expect(result.handStrength).toBeGreaterThanOrEqual(0);
    expect(result.handStrength).toBeLessThanOrEqual(1);
    expect(typeof result.potOdds).toBe('number');
    expect(typeof result.spr).toBe('number');
    expect(result.isDegraded).toBe(true); // heuristic always degraded
  });

  it('should include check and bet when not facing a bet', () => {
    const ctx = makePostflopContext({ actionHistory: [] });
    const result = evaluatePostflop(ctx);

    const actionTypes = result.actions.map(a => a.action);
    expect(actionTypes).toContain('check');
    // Should have at least one bet option
    const hasBetOrAllIn = actionTypes.includes('bet') || actionTypes.includes('all_in');
    expect(hasBetOrAllIn).toBe(true);
  });

  it('should include fold, call, raise when facing a bet', () => {
    const ctx = makePostflopContext({
      actionHistory: [
        {
          seat: 2,
          playerName: 'BOT',
          action: 'bet',
          amount: 4,
          street: 'flop',
          potAfter: 10,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    const result = evaluatePostflop(ctx);

    const actionTypes = result.actions.map(a => a.action);
    expect(actionTypes).toContain('fold');
    expect(actionTypes).toContain('call');
  });

  it('should assign frequencies that roughly sum to 1', () => {
    const ctx = makePostflopContext();
    const result = evaluatePostflop(ctx);

    const freqSum = result.actions.reduce((sum, a) => sum + a.frequency, 0);
    // Allow some rounding tolerance
    expect(freqSum).toBeGreaterThan(0.8);
    expect(freqSum).toBeLessThan(1.2);
  });

  it('should produce higher EV for strong hands', () => {
    // Strong hand: top pair top kicker
    const strongCtx = makePostflopContext({
      holeCards: [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 'h' },
      ],
      communityCards: [
        { rank: 'A', suit: 'h' },
        { rank: '7', suit: 'd' },
        { rank: '2', suit: 'c' },
      ],
    });

    // Weak hand: no pair
    const weakCtx = makePostflopContext({
      holeCards: [
        { rank: '3', suit: 's' },
        { rank: '4', suit: 'h' },
      ],
      communityCards: [
        { rank: 'A', suit: 'h' },
        { rank: 'K', suit: 'd' },
        { rank: 'Q', suit: 'c' },
      ],
    });

    const strongResult = evaluatePostflop(strongCtx);
    const weakResult = evaluatePostflop(weakCtx);

    // Strong hand should have higher check EV
    const strongCheckEV = strongResult.actions.find(a => a.action === 'check')?.evBB ?? 0;
    const weakCheckEV = weakResult.actions.find(a => a.action === 'check')?.evBB ?? 0;

    expect(strongCheckEV).toBeGreaterThan(weakCheckEV);
  });

  it('should give position advantage to BTN', () => {
    const btnCtx = makePostflopContext({ position: 'BTN' });
    const utgCtx = makePostflopContext({ position: 'UTG' });

    const btnResult = evaluatePostflop(btnCtx);
    const utgResult = evaluatePostflop(utgCtx);

    // BTN should have slightly higher hand strength due to position multiplier
    expect(btnResult.handStrength).toBeGreaterThanOrEqual(utgResult.handStrength);
  });

  it('should handle river street', () => {
    const ctx = makePostflopContext({
      street: 'river',
      communityCards: [
        { rank: 'A', suit: 'h' },
        { rank: '7', suit: 'd' },
        { rank: '2', suit: 'c' },
        { rank: 'J', suit: 's' },
        { rank: '9', suit: 'h' },
      ],
    });

    const result = evaluatePostflop(ctx);
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeTruthy();
  });

  it('should handle low SPR situations', () => {
    const ctx = makePostflopContext({
      stackBB: 3,
      potBB: 10,
    });

    const result = evaluatePostflop(ctx);
    expect(result.spr).toBeLessThan(1);
    expect(result.actions.length).toBeGreaterThan(0);
  });
});

describe('GTOClient', () => {
  let client: GTOClient;

  beforeEach(() => {
    client = new GTOClient(1000);
  });

  afterEach(() => {
    client.dispose();
  });

  it('should fall back to heuristic when worker is not available', async () => {
    // In test environment, Worker is mocked and won't work
    client.init();

    const request: GTOEvaluationRequest = {
      holeCards: [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 'h' },
      ],
      communityCards: [
        { rank: 'A', suit: 'h' },
        { rank: '7', suit: 'd' },
        { rank: '2', suit: 'c' },
      ],
      position: 'BTN',
      potBB: 6,
      stackBB: 97,
      street: 'flop',
      actionHistory: [],
    };

    const result = await client.evaluate(request);
    expect(result).toBeDefined();
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeTruthy();
  });

  it('should provide sync evaluation', () => {
    const request: GTOEvaluationRequest = {
      holeCards: [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 'h' },
      ],
      communityCards: [
        { rank: 'A', suit: 'h' },
        { rank: '7', suit: 'd' },
        { rank: '2', suit: 'c' },
      ],
      position: 'BTN',
      potBB: 6,
      stackBB: 97,
      street: 'flop',
      actionHistory: [],
    };

    const result = client.evaluateSync(request);
    expect(result.isDegraded).toBe(true);
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('should clean up pending requests on dispose', () => {
    client.init();
    client.dispose();

    expect(client.isWorkerAvailable).toBe(false);
  });
});
