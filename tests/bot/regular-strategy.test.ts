import { describe, it, expect } from 'vitest';
import { RegularStrategy } from '../../src/bot/strategies/regular';
import type { BotDecisionContext } from '../../src/bot/bot-manager';
import type { HandState, PlayerState } from '../../src/types';

function makeContext(overrides: Partial<BotDecisionContext> = {}): BotDecisionContext {
  const player: PlayerState = {
    seat: 1, name: 'RegBot', position: 'UTG', stack: 100,
    hole_cards: null, is_active: true, is_all_in: false, is_bot: true,
    current_bet: 0, total_invested: 0, last_action: null,
  };
  const state: HandState = {
    id: 'h1', session_id: 's1', hand_number: 1, street: 'preflop',
    pot: 3, community_cards: [],
    players: [
      { seat: 0, name: 'Hero', position: 'BB', stack: 98, hole_cards: null,
        is_active: true, is_all_in: false, is_bot: false, current_bet: 2,
        total_invested: 2, last_action: null },
      { ...player },
    ],
    current_player_seat: 1, dealer_seat: 2, is_user_turn: false,
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

describe('RegularStrategy', () => {
  const strategy = new RegularStrategy();

  it('should fold weak hands out of position', () => {
    // 72o UTG — should mostly fold
    let foldCount = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(makeContext());
      if (result.action === 'fold') foldCount++;
    }
    // TAG should fold 72o UTG most of the time
    expect(foldCount / trials).toBeGreaterThan(0.5);
  });

  it('should raise strong hands in late position', () => {
    const ctx = makeContext({
      holeCards: [{ rank: 'A', suit: 'spades' }, { rank: 'A', suit: 'hearts' }],
    });
    // Override position to BTN
    ctx.handState.players[1].position = 'BTN';
    // No bet to call (checking from BTN)
    ctx.handState.players[0].current_bet = 0;

    let raiseCount = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(ctx);
      if (result.action === 'raise') raiseCount++;
    }
    expect(raiseCount / trials).toBeGreaterThan(0.5);
  });

  it('should call with drawing hands given proper pot odds', () => {
    // Medium hand postflop facing a small bet with good pot odds
    const ctx = makeContext({
      holeCards: [{ rank: 'J', suit: 'hearts' }, { rank: 'T', suit: 'hearts' }],
    });
    ctx.handState.street = 'flop';
    ctx.handState.community_cards = [
      { rank: '9', suit: 'hearts' }, { rank: '3', suit: 'hearts' },
      { rank: '2', suit: 'clubs' },
    ];
    ctx.handState.pot = 20;
    // Facing small bet (good pot odds)
    ctx.handState.players[0].current_bet = 5;
    ctx.handState.players[1].current_bet = 0;

    let callOrRaise = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(ctx);
      if (result.action === 'call' || result.action === 'raise') callOrRaise++;
    }
    expect(callOrRaise / trials).toBeGreaterThan(0.4);
  });

  it('should respect position-based ranges from preflop table', () => {
    // AKo in CO — should open raise
    const ctx = makeContext({
      holeCards: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'hearts' }],
    });
    ctx.handState.players[1].position = 'CO';
    ctx.handState.players[0].current_bet = 0; // no bet to call

    let raiseCount = 0;
    const trials = 50;
    for (let i = 0; i < trials; i++) {
      const result = strategy.decide(ctx);
      if (result.action === 'raise') raiseCount++;
    }
    expect(raiseCount / trials).toBeGreaterThan(0.5);
  });

  it('should complete within 200ms', () => {
    const ctx = makeContext();
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      strategy.decide(ctx);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });
});
