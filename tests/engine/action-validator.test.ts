import { describe, it, expect } from 'vitest';
import {
  getAvailableActions,
  validateAction,
  computeMinRaise,
  computeMaxRaise,
} from '../../src/engine/action-validator';
import type { HandState, PlayerState } from '../../src/types';

function makeState(overrides: Partial<HandState> = {}): HandState {
  return {
    id: 'test-h1',
    session_id: 'test-session',
    hand_number: 1,
    street: 'preflop',
    pot: 3,
    community_cards: [],
    players: [],
    current_player_seat: 0,
    dealer_seat: 0,
    is_user_turn: true,
    available_actions: [],
    min_raise: null,
    max_raise: null,
    status: 'in_progress',
    ...overrides,
  };
}

function makePlayer(seat: number, overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    seat,
    name: `Player${seat}`,
    position: 'UTG',
    stack: 100,
    hole_cards: null,
    is_active: true,
    is_all_in: false,
    is_bot: false,
    current_bet: 0,
    total_invested: 0,
    last_action: null,
    ...overrides,
  };
}

describe('Action Validator', () => {
  it('should return valid actions for player facing a bet', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 100 });
    const state = makeState({ players: [player], current_player_seat: 0 });
    const highestBet = 10;
    const actions = getAvailableActions(state, player, highestBet, 2);

    const types = actions.map((a) => a.type);
    expect(types).toContain('fold');
    expect(types).toContain('call');
    expect(types).toContain('all_in');
    // Should not contain check when facing a bet
    expect(types).not.toContain('check');
  });

  it('should allow check when no bet is facing', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 100 });
    const state = makeState({ players: [player], current_player_seat: 0 });
    const highestBet = 0;
    const actions = getAvailableActions(state, player, highestBet, 2);

    const types = actions.map((a) => a.type);
    expect(types).toContain('check');
    expect(types).not.toContain('fold');
    expect(types).not.toContain('call');
  });

  it('should enforce minimum raise size', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 100 });
    const state = makeState({
      players: [player, makePlayer(1, { current_bet: 10 })],
      current_player_seat: 0,
    });

    const result = validateAction(state, player, { action: 'raise', amount: 5 }, 10, 2);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least/);
  });

  it('should cap raise to player\'s remaining stack (all-in)', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 50 });
    const maxRaise = computeMaxRaise(player);
    expect(maxRaise).toBe(50); // stack + current_bet = 50 + 0

    // Validate that raising to max is valid
    const state = makeState({
      players: [player, makePlayer(1, { current_bet: 10 })],
      current_player_seat: 0,
    });
    const result = validateAction(state, player, { action: 'raise', amount: 50 }, 10, 2);
    expect(result.valid).toBe(true);
  });

  it('should reject check when facing a bet', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 100 });
    const state = makeState({
      players: [player, makePlayer(1, { current_bet: 10 })],
      current_player_seat: 0,
    });
    const result = validateAction(state, player, { action: 'check' }, 10, 2);
    expect(result.valid).toBe(false);
  });

  it('should reject fold when nothing to call', () => {
    const player = makePlayer(0, { current_bet: 0, stack: 100 });
    const state = makeState({
      players: [player],
      current_player_seat: 0,
    });
    const result = validateAction(state, player, { action: 'fold' }, 0, 2);
    expect(result.valid).toBe(false);
  });
});
