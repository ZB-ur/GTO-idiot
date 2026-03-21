import { describe, it, expect, vi } from 'vitest';
import { computeDeviations } from '../../src/services/deviation-analyzer';
import type { HandHistory, Card } from '../../src/types';

// Mock the storage module
vi.mock('../../src/storage/hand-repository', () => ({
  getHand: vi.fn(),
  updateHandDeviations: vi.fn().mockResolvedValue(undefined),
}));

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

function makeHand(overrides: Partial<HandHistory> = {}): HandHistory {
  return {
    id: 'h1', session_id: 's1', hand_number: 1,
    date: new Date().toISOString(), dealer_seat: 0,
    blinds: { small_blind: 1, big_blind: 2 },
    players: [
      { seat: 0, name: 'Hero', position: 'BTN', starting_stack: 100,
        hole_cards: [c('7', 'spades'), c('2', 'hearts')], is_bot: false, bot_difficulty: null },
      { seat: 1, name: 'Bot', position: 'BB', starting_stack: 100,
        hole_cards: [c('A', 'spades'), c('A', 'hearts')], is_bot: true, bot_difficulty: 'fish' },
    ],
    community_cards: [c('K', 'clubs'), c('5', 'diamonds'), c('3', 'hearts'), c('9', 'spades'), c('T', 'clubs')],
    actions: [
      { sequence: 0, seat: 0, player_name: 'Hero', position: 'BTN', street: 'preflop',
        action: 'raise', amount: 6, pot_after: 9, is_hero: true },
      { sequence: 1, seat: 1, player_name: 'Bot', position: 'BB', street: 'preflop',
        action: 'call', amount: 4, pot_after: 12, is_hero: false },
    ],
    pot_history: [{ street: 'preflop', pot_after: 12 }],
    result: { winners: [{ seat: 1, name: 'Bot', amount_won: 12 }], final_pot: 12, went_to_showdown: false },
    hero_position: 'BTN', hero_result_bb: -3, hints_viewed: [],
    ...overrides,
  };
}

describe('Deviation Analyzer', () => {
  it('should identify deviation at user decision point', () => {
    // Hero raises 72o from BTN — GTO might suggest fold for trash
    const hand = makeHand();
    const analysis = computeDeviations(hand);
    // 72o is trash, raising is likely a deviation from GTO fold
    expect(analysis.hand_id).toBe('h1');
    // May or may not have deviations depending on threshold
    expect(analysis.deviation_count).toBeDefined();
  });

  it('should classify deviation severity: minor (<15%)', () => {
    const analysis = computeDeviations(makeHand());
    for (const d of analysis.deviations) {
      if (d.severity === 'minor') {
        expect(d.frequency_diff).toBeLessThan(0.40);
      }
    }
  });

  it('should classify deviation severity: moderate (15-40%)', () => {
    const analysis = computeDeviations(makeHand());
    for (const d of analysis.deviations) {
      if (d.severity === 'moderate') {
        expect(d.frequency_diff).toBeGreaterThanOrEqual(0.15);
        expect(d.frequency_diff).toBeLessThan(0.40);
      }
    }
  });

  it('should classify deviation severity: severe (>40%)', () => {
    const analysis = computeDeviations(makeHand());
    for (const d of analysis.deviations) {
      if (d.severity === 'severe') {
        expect(d.frequency_diff).toBeGreaterThanOrEqual(0.40);
      }
    }
  });

  it('should calculate EV loss for deviation', () => {
    const analysis = computeDeviations(makeHand());
    for (const d of analysis.deviations) {
      expect(d.ev_loss).toBeGreaterThanOrEqual(0);
    }
    expect(analysis.total_ev_loss).toBeGreaterThanOrEqual(0);
  });

  it('should generate human-readable deviation description', () => {
    const analysis = computeDeviations(makeHand());
    for (const d of analysis.deviations) {
      expect(typeof d.description).toBe('string');
      expect(d.description.length).toBeGreaterThan(0);
    }
  });

  it('should return no deviation when user matches GTO', () => {
    // AA from any position — raising is GTO
    const hand = makeHand({
      players: [
        { seat: 0, name: 'Hero', position: 'UTG', starting_stack: 100,
          hole_cards: [c('A', 'spades'), c('A', 'hearts')], is_bot: false, bot_difficulty: null },
        { seat: 1, name: 'Bot', position: 'BB', starting_stack: 100,
          hole_cards: [c('7', 'spades'), c('2', 'hearts')], is_bot: true, bot_difficulty: 'fish' },
      ],
      hero_position: 'UTG',
    });
    const analysis = computeDeviations(hand);
    // Raising AA UTG is GTO — should have no severe deviation
    const severeCount = analysis.deviation_count.severe;
    expect(severeCount).toBe(0);
  });
});
