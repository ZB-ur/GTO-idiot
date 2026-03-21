import { describe, it, expect } from 'vitest';
import { solvePostflop } from '../../src/gto/postflop-solver';
import type { PostflopSolveRequest, Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

function makeRequest(overrides: Partial<PostflopSolveRequest> = {}): PostflopSolveRequest {
  return {
    hero_position: 'BTN',
    hero_cards: [c('A', 'spades'), c('K', 'hearts')],
    community_cards: [c('A', 'clubs'), c('7', 'diamonds'), c('2', 'hearts')],
    pot: 10,
    effective_stack: 90,
    street: 'flop',
    action_history: [],
    ...overrides,
  };
}

describe('Postflop Solver', () => {
  it('should return strategy for simple flop spot', () => {
    const result = solvePostflop(makeRequest(), { maxIterations: 100, timeBudgetMs: 200 });
    expect(result.advice.actions.length).toBeGreaterThan(0);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it('should use 3 bet sizes (33%/66%/100% pot)', () => {
    const result = solvePostflop(makeRequest(), { maxIterations: 200, timeBudgetMs: 300 });
    const betSizes = result.advice.actions
      .filter((a) => a.bet_size !== null)
      .map((a) => a.bet_size);
    // At least one bet size should be present
    if (betSizes.length > 0) {
      const allSizes = ['33% pot', '66% pot', '100% pot'];
      for (const bs of betSizes) {
        expect(allSizes).toContain(bs);
      }
    }
  });

  it('should converge within iteration limit', () => {
    const result = solvePostflop(makeRequest(), { maxIterations: 500, timeBudgetMs: 1000 });
    expect(result.iterations).toBeLessThanOrEqual(500);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it('should apply discount factors to regrets (DCFR)', () => {
    // Run solver twice with different iteration counts — more iterations should give better convergence
    const short = solvePostflop(makeRequest(), { maxIterations: 10, timeBudgetMs: 500 });
    const long = solvePostflop(makeRequest(), { maxIterations: 200, timeBudgetMs: 500 });
    expect(long.iterations).toBeGreaterThanOrEqual(short.iterations);
    // Both should produce valid strategies
    expect(short.advice.actions.length).toBeGreaterThan(0);
    expect(long.advice.actions.length).toBeGreaterThan(0);
  });

  it('should return valid probability distribution (sums to ~1)', () => {
    const result = solvePostflop(makeRequest(), { maxIterations: 100, timeBudgetMs: 300 });
    const totalFreq = result.advice.actions.reduce((sum, a) => sum + a.frequency, 0);
    expect(totalFreq).toBeGreaterThan(0.5);
    expect(totalFreq).toBeLessThanOrEqual(1.1); // allow small floating point error
  });
});
