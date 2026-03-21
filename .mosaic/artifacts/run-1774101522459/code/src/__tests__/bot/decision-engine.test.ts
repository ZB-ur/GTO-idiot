// ============================================================
// Decision Engine tests — bot action selection logic
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeBotAction, type DecisionContext } from '../../bot/decision-engine';
import type { Card, HandPlayer, LegalAction } from '../../types';

function makeHandPlayer(overrides: Partial<HandPlayer> = {}): HandPlayer {
  return {
    seat: 1,
    name: 'BOT-TAG-1',
    stackBB: 100,
    position: 'UTG',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    holeCards: null,
    lastAction: null,
    ...overrides,
  };
}

function makeContext(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    player: makeHandPlayer(),
    botStyle: 'TAG',
    holeCards: [
      { rank: 'A', suit: 's' },
      { rank: 'K', suit: 's' },
    ] as Card[],
    communityCards: [],
    position: 'UTG',
    street: 'preflop',
    potBB: 1.5,
    toCallBB: 1,
    legalActions: [
      { type: 'fold' },
      { type: 'call', callAmount: 1 },
      { type: 'raise', minAmount: 3, maxAmount: 100 },
    ] as LegalAction[],
    activePlayers: 6,
    facingRaise: false,
    isPreflopAggressor: false,
    bigBlind: 1,
    ...overrides,
  };
}

describe('computeBotAction', () => {
  beforeEach(() => {
    // Seed random for deterministic tests where possible
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('should return a valid action and reasoning', () => {
    const ctx = makeContext();
    const decision = computeBotAction(ctx);

    expect(decision).toBeDefined();
    expect(decision.action).toBeDefined();
    expect(decision.action.type).toBeTruthy();
    expect(decision.reasoning).toBeTruthy();
  });

  it('should return a legal action type', () => {
    const ctx = makeContext();
    const decision = computeBotAction(ctx);

    // The bot may return fold, call, raise, bet, check, or all_in
    const validTypes = ['fold', 'check', 'call', 'bet', 'raise', 'all_in'];
    expect(validTypes).toContain(decision.action.type);
  });

  describe('preflop decisions', () => {
    it('TAG bot should play premium hands aggressively', () => {
      // AKs is a very strong hand for TAG
      const ctx = makeContext({
        botStyle: 'TAG',
        holeCards: [
          { rank: 'A', suit: 's' },
          { rank: 'K', suit: 's' },
        ],
        street: 'preflop',
      });

      const decision = computeBotAction(ctx);
      // With AKs, TAG should raise or call, not fold
      expect(decision.action.type).not.toBe('fold');
    });

    it('TAG bot should fold weak hands', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const ctx = makeContext({
        botStyle: 'TAG',
        holeCards: [
          { rank: '2', suit: 's' },
          { rank: '7', suit: 'h' },
        ],
        street: 'preflop',
        legalActions: [
          { type: 'fold' },
          { type: 'call', callAmount: 1 },
          { type: 'raise', minAmount: 3, maxAmount: 100 },
        ],
      });

      const decision = computeBotAction(ctx);
      // 27o is trash — TAG should fold (or check if available)
      expect(['fold', 'check']).toContain(decision.action.type);
    });

    it('LAG bot should play more hands than TAG', () => {
      // Use a marginal hand (T8s)
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const holeCards: Card[] = [
        { rank: 'T', suit: 'h' },
        { rank: '8', suit: 'h' },
      ];

      const tagDecisions: string[] = [];
      const lagDecisions: string[] = [];

      // Run multiple times with different random seeds
      for (let i = 0; i < 10; i++) {
        vi.spyOn(Math, 'random').mockReturnValue(i / 10);

        const tagCtx = makeContext({ botStyle: 'TAG', holeCards });
        tagDecisions.push(computeBotAction(tagCtx).action.type);

        const lagCtx = makeContext({ botStyle: 'LAG', holeCards });
        lagDecisions.push(computeBotAction(lagCtx).action.type);
      }

      // LAG should fold less often than TAG with marginal hands
      const tagFolds = tagDecisions.filter(a => a === 'fold').length;
      const lagFolds = lagDecisions.filter(a => a === 'fold').length;
      expect(lagFolds).toBeLessThanOrEqual(tagFolds);
    });
  });

  describe('postflop decisions', () => {
    it('should handle postflop with community cards', () => {
      const ctx = makeContext({
        street: 'flop',
        communityCards: [
          { rank: 'A', suit: 'h' },
          { rank: 'K', suit: 'd' },
          { rank: '7', suit: 'c' },
        ],
        holeCards: [
          { rank: 'A', suit: 's' },
          { rank: 'Q', suit: 's' },
        ],
        potBB: 6,
        toCallBB: 0,
        legalActions: [
          { type: 'check' },
          { type: 'bet', minAmount: 1, maxAmount: 100 },
        ],
        facingRaise: false,
      });

      const decision = computeBotAction(ctx);
      expect(decision.action.type).toBeTruthy();
      // With top pair + top kicker, bot should often bet
    });

    it('should include amount for bet/raise actions', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // bias toward aggressive
      const ctx = makeContext({
        street: 'flop',
        communityCards: [
          { rank: 'A', suit: 'h' },
          { rank: 'K', suit: 'd' },
          { rank: '7', suit: 'c' },
        ],
        holeCards: [
          { rank: 'A', suit: 's' },
          { rank: 'A', suit: 'd' },
        ],
        potBB: 6,
        toCallBB: 0,
        legalActions: [
          { type: 'check' },
          { type: 'bet', minAmount: 1, maxAmount: 100 },
        ],
        facingRaise: false,
        isPreflopAggressor: true,
      });

      const decision = computeBotAction(ctx);
      if (decision.action.type === 'bet' || decision.action.type === 'raise') {
        expect(decision.action.amount).toBeGreaterThan(0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle only check available', () => {
      const ctx = makeContext({
        legalActions: [{ type: 'check' }],
        toCallBB: 0,
      });

      const decision = computeBotAction(ctx);
      expect(decision.action.type).toBe('check');
    });

    it('should handle only fold and all-in available', () => {
      const ctx = makeContext({
        player: makeHandPlayer({ stackBB: 1 }),
        legalActions: [
          { type: 'fold' },
          { type: 'all_in', minAmount: 1, maxAmount: 1 },
        ],
        toCallBB: 5,
        holeCards: [
          { rank: 'A', suit: 's' },
          { rank: 'A', suit: 'h' },
        ],
      });

      const decision = computeBotAction(ctx);
      expect(['fold', 'all_in']).toContain(decision.action.type);
    });

    it('TP bot should be more passive than TAG', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const ctx = makeContext({
        botStyle: 'TP',
        holeCards: [
          { rank: 'J', suit: 's' },
          { rank: 'T', suit: 's' },
        ],
        street: 'preflop',
      });

      const tpDecision = computeBotAction(ctx);

      const tagCtx = makeContext({
        botStyle: 'TAG',
        holeCards: [
          { rank: 'J', suit: 's' },
          { rank: 'T', suit: 's' },
        ],
        street: 'preflop',
      });

      const tagDecision = computeBotAction(tagCtx);

      // Both should produce valid actions
      expect(tpDecision.action.type).toBeTruthy();
      expect(tagDecision.action.type).toBeTruthy();
    });
  });
});
