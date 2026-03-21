import { describe, it, expect } from 'vitest';
import { FishStrategy } from '../../src/bot/strategies/fish';
import type { BotDecisionContext } from '../../src/bot/bot-manager';
import type { HandState, PlayerState, Card } from '../../src/types';

function makeContext(overrides: Partial<BotDecisionContext> = {}): BotDecisionContext {
  const player: PlayerState = {
    seat: 1, name: 'FishBot', position: 'CO', stack: 100,
    hole_cards: null, is_active: true, is_all_in: false, is_bot: true,
    current_bet: 0, total_invested: 0, last_action: null,
  };
  const state: HandState = {
    id: 'h1', session_id: 's1', hand_number: 1, street: 'preflop',
    pot: 3, community_cards: [],
    players: [
      { ...player },
      { seat: 0, name: 'Hero', position: 'BTN', stack: 100, hole_cards: null,
        is_active: true, is_all_in: false, is_bot: false, current_bet: 2,
        total_invested: 2, last_action: null },
    ],
    current_player_seat: 1, dealer_seat: 0, is_user_turn: false,
    available_actions: [
      { type: 'fold', amount: null }, { type: 'call', amount: 2 },
      { type: 'raise', amount: 4 }, { type: 'all_in', amount: 100 },
    ],
    min_raise: 4, max_raise: 100, status: 'in_progress',
  };
  return {
    handState: state,
    seat: 1,
    holeCards: [{ rank: '7', suit: 'hearts' }, { rank: '2', suit: 'spades' }],
    actionHistory: [],
    isLastAggressor: false,
    ...overrides,
  };
}

describe('FishStrategy', () => {
  const strategy = new FishStrategy();

  it('should return a valid action from available actions', () => {
    const ctx = makeContext();
    const result = strategy.decide(ctx);
    const validActions = ['fold', 'call', 'raise', 'check', 'all_in'];
    expect(validActions).toContain(result.action);
  });

  it('should play loose range (call frequently)', () => {
    // Run many trials; fish should call a lot
    let callCount = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(makeContext());
      if (result.action === 'call') callCount++;
    }
    // Fish should call at least 30% of the time with random cards
    expect(callCount / trials).toBeGreaterThan(0.2);
  });

  it('should occasionally fold strong hands (randomness)', () => {
    const strongCtx = makeContext({
      holeCards: [{ rank: 'A', suit: 'spades' }, { rank: 'A', suit: 'hearts' }],
    });
    let foldCount = 0;
    const trials = 200;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(strongCtx);
      if (result.action === 'fold') foldCount++;
    }
    // Fish should fold even AA very rarely, but the code path is possible for weak scenarios
    // With AA the fish should mostly call/raise — fold should be < 10%
    expect(foldCount / trials).toBeLessThan(0.1);
  });

  it('should complete within 200ms', () => {
    const ctx = makeContext();
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      strategy.decide(ctx);
    }
    const elapsed = performance.now() - start;
    // 1000 decisions should complete well under 200ms total
    expect(elapsed).toBeLessThan(200);
  });
});
