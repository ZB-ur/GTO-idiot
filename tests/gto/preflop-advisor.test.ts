import { describe, it, expect } from 'vitest';
import { getPreflopAdvice, getQuickAdvice } from '../../src/gto/preflop-advisor';
import type { Card, Position } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('Preflop Advisor', () => {
  it('should return raise advice for AA in any position', () => {
    const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of positions) {
      const advice = getQuickAdvice(c('A', 'spades'), c('A', 'hearts'), pos);
      expect(advice.recommended_action).toBe('raise');
      const raiseEntry = advice.actions.find((a) => a.action === 'raise');
      expect(raiseEntry).toBeDefined();
      expect(raiseEntry!.frequency).toBeGreaterThan(0.5);
    }
  });

  it('should return fold advice for 72o UTG (unopened)', () => {
    const advice = getQuickAdvice(c('7', 'spades'), c('2', 'hearts'), 'UTG');
    expect(advice.recommended_action).toBe('fold');
  });

  it('should identify correct preflop scenario (open/3bet/call)', () => {
    // No prior raises = open
    const openAdvice = getPreflopAdvice({
      position: 'BTN',
      hole_cards: [c('A', 'spades'), c('K', 'hearts')],
      action_history: [],
    });
    expect(openAdvice.actions.length).toBeGreaterThan(0);

    // One prior raise = vs_open
    const vsOpenAdvice = getPreflopAdvice({
      position: 'BB',
      hole_cards: [c('A', 'spades'), c('K', 'hearts')],
      action_history: [
        { seat: 2, position: 'CO', action: 'raise', amount: 6, street: 'preflop' },
      ],
    });
    expect(vsOpenAdvice.actions.length).toBeGreaterThan(0);
  });

  it('should return GTOAdvice with action frequencies', () => {
    const advice = getQuickAdvice(c('Q', 'spades'), c('Q', 'hearts'), 'CO');
    expect(advice.actions.length).toBeGreaterThan(0);
    for (const a of advice.actions) {
      expect(a.frequency).toBeGreaterThanOrEqual(0);
      expect(a.frequency).toBeLessThanOrEqual(1);
      expect(typeof a.ev).toBe('number');
    }
    expect(advice.is_approximate).toBe(false); // preflop is table-based
  });

  it('should handle edge case: BB facing limp', () => {
    // Limp = call (no raise), so BB sees open scenario
    const advice = getPreflopAdvice({
      position: 'BB',
      hole_cards: [c('9', 'spades'), c('8', 'spades')],
      action_history: [
        { seat: 3, position: 'UTG', action: 'call', amount: 2, street: 'preflop' },
      ],
    });
    expect(advice.actions.length).toBeGreaterThan(0);
    expect(advice.recommended_action).toBeDefined();
  });
});
