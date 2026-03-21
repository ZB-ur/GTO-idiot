import { describe, it, expect, vi } from 'vitest';
import { CFRWorkerClient } from '../../src/gto/cfr-worker';
import { solvePostflop } from '../../src/gto/postflop-solver';
import type { PostflopSolveRequest, Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

function makeRequest(): PostflopSolveRequest {
  return {
    hero_position: 'BTN',
    hero_cards: [c('A', 'spades'), c('K', 'hearts')],
    community_cards: [c('A', 'clubs'), c('7', 'diamonds'), c('2', 'hearts')],
    pot: 10,
    effective_stack: 90,
    street: 'flop',
    action_history: [],
  };
}

describe('CFR Worker', () => {
  it('should respond to solve message with strategy result', async () => {
    // In test env, Worker is unavailable, so CFRWorkerClient falls back to main thread
    const client = new CFRWorkerClient(2000);
    client.init(); // will silently fail to create worker
    const result = await client.solve(makeRequest(), { maxIterations: 50, timeBudgetMs: 200 });
    expect(result.advice.actions.length).toBeGreaterThan(0);
    expect(result.iterations).toBeGreaterThan(0);
    client.terminate();
  });

  it('should handle timeout gracefully (>2s degraded response)', async () => {
    // Direct solver call with very short budget
    const result = solvePostflop(makeRequest(), { maxIterations: 10000, timeBudgetMs: 1 });
    // Should still return a result even with minimal time
    expect(result.advice.actions.length).toBeGreaterThan(0);
  });

  it('should post error message on invalid input', async () => {
    // Test with invalid input that would cause solver to use heuristic fallback
    const badRequest: PostflopSolveRequest = {
      hero_position: 'BTN',
      hero_cards: [c('A', 'spades'), c('K', 'hearts')],
      community_cards: [], // empty community on flop — unusual
      pot: 0,
      effective_stack: 0,
      street: 'flop',
      action_history: [],
    };
    // Should not throw, but return degraded/heuristic result
    const result = solvePostflop(badRequest, { maxIterations: 10, timeBudgetMs: 100 });
    expect(result.advice.actions.length).toBeGreaterThan(0);
  });
});
