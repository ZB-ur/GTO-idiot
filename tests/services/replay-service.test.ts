import { describe, it, expect, vi } from 'vitest';
import { buildReplayData } from '../../src/services/replay-service';
import type { HandHistory, Card } from '../../src/types';

vi.mock('../../src/storage/hand-repository', () => ({
  getHand: vi.fn(),
}));

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

function makeHand(): HandHistory {
  return {
    id: 'h1', session_id: 's1', hand_number: 1,
    date: new Date().toISOString(), dealer_seat: 0,
    blinds: { small_blind: 1, big_blind: 2 },
    players: [
      { seat: 0, name: 'Hero', position: 'BTN', starting_stack: 100,
        hole_cards: [c('A', 'spades'), c('K', 'hearts')], is_bot: false, bot_difficulty: null },
      { seat: 1, name: 'Bot', position: 'BB', starting_stack: 100,
        hole_cards: [c('Q', 'spades'), c('Q', 'hearts')], is_bot: true, bot_difficulty: 'regular' },
    ],
    community_cards: [c('A', 'clubs'), c('7', 'diamonds'), c('2', 'hearts'), c('9', 'spades'), c('T', 'clubs')],
    actions: [
      { sequence: 0, seat: 0, player_name: 'Hero', position: 'BTN', street: 'preflop', action: 'raise', amount: 6, pot_after: 9, is_hero: true },
      { sequence: 1, seat: 1, player_name: 'Bot', position: 'BB', street: 'preflop', action: 'call', amount: 4, pot_after: 12, is_hero: false },
      { sequence: 2, seat: 1, player_name: 'Bot', position: 'BB', street: 'flop', action: 'check', amount: null, pot_after: 12, is_hero: false },
      { sequence: 3, seat: 0, player_name: 'Hero', position: 'BTN', street: 'flop', action: 'raise', amount: 8, pot_after: 20, is_hero: true },
      { sequence: 4, seat: 1, player_name: 'Bot', position: 'BB', street: 'flop', action: 'fold', amount: null, pot_after: 20, is_hero: false },
    ],
    pot_history: [{ street: 'preflop', pot_after: 12 }, { street: 'flop', pot_after: 20 }],
    result: { winners: [{ seat: 0, name: 'Hero', amount_won: 20 }], final_pot: 20, went_to_showdown: false },
    hero_position: 'BTN', hero_result_bb: 4, hints_viewed: [],
  };
}

describe('Replay Service', () => {
  it('should convert hand history to ReplayStep array', () => {
    const replay = buildReplayData(makeHand());
    expect(replay.steps.length).toBeGreaterThan(0);
    expect(replay.hand_id).toBe('h1');
    expect(replay.total_steps).toBe(replay.steps.length);
  });

  it('should calculate correct street indexes for jumping', () => {
    const replay = buildReplayData(makeHand());
    expect(replay.street_indices.preflop).toBe(0);
    expect(replay.street_indices.flop).not.toBeNull();
    // Turn/river null since hand ended on flop
    expect(replay.street_indices.turn).toBeNull();
    expect(replay.street_indices.river).toBeNull();
  });

  it('should include all player actions in replay steps', () => {
    const replay = buildReplayData(makeHand());
    const actionSteps = replay.steps.filter((s) => s.type === 'player_action');
    expect(actionSteps.length).toBe(5); // all 5 actions from hand history
  });

  it('should handle hand ending before river (early fold)', () => {
    const replay = buildReplayData(makeHand());
    // Hand ends on flop with fold; no showdown step
    const showdownSteps = replay.steps.filter((s) => s.type === 'showdown');
    expect(showdownSteps.length).toBe(0);
  });
});
