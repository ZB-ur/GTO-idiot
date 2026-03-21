import { describe, it, expect } from 'vitest';
import type {
  Card, Rank, Suit, Position, Street, ActionType, BotDifficulty,
  Session, HandState, PlayerState, GTOAdvice, Deviation, KeyMetrics,
} from '../../src/types';

describe('Type Definitions', () => {
  it('should export all core types (Card, Position, Street, etc.)', () => {
    // Verify types compile and are usable
    const card: Card = { rank: 'A', suit: 'spades' };
    expect(card.rank).toBe('A');
    expect(card.suit).toBe('spades');

    const street: Street = 'preflop';
    expect(street).toBe('preflop');

    const action: ActionType = 'raise';
    expect(action).toBe('raise');
  });

  it('should enforce Card type constraints (valid suits and ranks)', () => {
    const validRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const validSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

    expect(validRanks.length).toBe(13);
    expect(validSuits.length).toBe(4);

    // Each combination should be a valid card
    for (const rank of validRanks) {
      for (const suit of validSuits) {
        const card: Card = { rank, suit };
        expect(card.rank).toBe(rank);
        expect(card.suit).toBe(suit);
      }
    }
  });

  it('should define all 6 positions for 6-max', () => {
    const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    expect(positions.length).toBe(6);
    // All should be unique
    expect(new Set(positions).size).toBe(6);
  });
});
