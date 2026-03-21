import { describe, it, expect } from 'vitest';
import {
  calculateSidePots,
  calculateTotalPot,
  distributePots,
  distributeToLastStanding,
  collectBets,
} from '../../src/engine/pot-calculator';
import type { PlayerState, Card } from '../../src/types';

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

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('Pot Calculator', () => {
  it('should calculate simple main pot', () => {
    const players = [
      makePlayer(0, { total_invested: 20, is_active: true }),
      makePlayer(1, { total_invested: 20, is_active: true }),
      makePlayer(2, { total_invested: 20, is_active: false }),
    ];
    const pots = calculateSidePots(players);
    // Only active players — but total_invested from all active/all-in
    const totalPot = calculateTotalPot(players);
    expect(totalPot).toBe(60);
  });

  it('should create side pot when one player is all-in', () => {
    const players = [
      makePlayer(0, { total_invested: 50, is_active: true, is_all_in: true, stack: 0 }),
      makePlayer(1, { total_invested: 100, is_active: true, stack: 0 }),
      makePlayer(2, { total_invested: 100, is_active: true, stack: 0 }),
    ];
    const pots = calculateSidePots(players);
    expect(pots.length).toBe(2);
    // Main pot: 50 × 3 = 150
    expect(pots[0].amount).toBe(150);
    expect(pots[0].eligible_seats).toContain(0);
    // Side pot: 50 × 2 = 100
    expect(pots[1].amount).toBe(100);
    expect(pots[1].eligible_seats).not.toContain(0);
  });

  it('should handle multiple side pots (3+ all-ins at different amounts)', () => {
    const players = [
      makePlayer(0, { total_invested: 30, is_active: true, is_all_in: true, stack: 0 }),
      makePlayer(1, { total_invested: 60, is_active: true, is_all_in: true, stack: 0 }),
      makePlayer(2, { total_invested: 100, is_active: true, stack: 0 }),
    ];
    const pots = calculateSidePots(players);
    // Pot 1: 30 × 3 = 90 (all 3 eligible)
    expect(pots[0].amount).toBe(90);
    // Pot 2: (60-30) × 2 = 60 (seats 1,2)
    expect(pots[1].amount).toBe(60);
    // Pot 3: remaining from seat 2
    expect(pots.length).toBeGreaterThanOrEqual(2);
  });

  it('should distribute pot to winner at showdown', () => {
    const community: Card[] = [
      c('2', 'clubs'), c('3', 'clubs'), c('4', 'clubs'),
      c('8', 'diamonds'), c('9', 'hearts'),
    ];
    const players = [
      makePlayer(0, {
        total_invested: 50, is_active: true, stack: 50,
        hole_cards: [c('A', 'spades'), c('A', 'hearts')],
      }),
      makePlayer(1, {
        total_invested: 50, is_active: true, stack: 50,
        hole_cards: [c('7', 'spades'), c('7', 'hearts')],
      }),
    ];

    const dist = distributePots(players, community);
    expect(dist.winners.length).toBeGreaterThanOrEqual(1);
    // AA should beat 77
    const aaWinner = dist.winners.find((w) => w.seat === 0);
    expect(aaWinner).toBeDefined();
    expect(aaWinner!.amount_won).toBe(100);
  });

  it('should split pot on tie', () => {
    const community: Card[] = [
      c('A', 'clubs'), c('K', 'clubs'), c('Q', 'clubs'),
      c('J', 'diamonds'), c('T', 'hearts'),
    ];
    // Both players have the same straight from community cards
    const players = [
      makePlayer(0, {
        total_invested: 50, is_active: true, stack: 50,
        hole_cards: [c('2', 'spades'), c('3', 'hearts')],
      }),
      makePlayer(1, {
        total_invested: 50, is_active: true, stack: 50,
        hole_cards: [c('2', 'hearts'), c('3', 'spades')],
      }),
    ];

    const dist = distributePots(players, community);
    expect(dist.winners.length).toBe(2);
    expect(dist.winners[0].amount_won).toBe(50);
    expect(dist.winners[1].amount_won).toBe(50);
  });

  it('should award side pot to eligible player only', () => {
    const community: Card[] = [
      c('2', 'clubs'), c('3', 'diamonds'), c('8', 'hearts'),
      c('9', 'spades'), c('T', 'clubs'),
    ];
    // Player 0 is all-in short, Player 1 has better hand but only eligible for side pot
    const players = [
      makePlayer(0, {
        total_invested: 30, is_active: true, is_all_in: true, stack: 0,
        hole_cards: [c('A', 'spades'), c('A', 'hearts')], // AA
      }),
      makePlayer(1, {
        total_invested: 100, is_active: true, stack: 0,
        hole_cards: [c('7', 'spades'), c('6', 'hearts')], // straight
      }),
      makePlayer(2, {
        total_invested: 100, is_active: true, stack: 0,
        hole_cards: [c('4', 'spades'), c('5', 'hearts')], // lower hand
      }),
    ];

    const dist = distributePots(players, community);
    // Seat 1 (7-6 straight: 6-7-8-9-T) should win — all eligible pots
    expect(dist.winners.some((w) => w.seat === 1)).toBe(true);
  });

  it('should distribute pot when all others fold (distributeToLastStanding)', () => {
    const players = [
      makePlayer(0, { total_invested: 50, is_active: true, stack: 50 }),
      makePlayer(1, { total_invested: 50, is_active: false, stack: 50 }),
    ];
    const dist = distributeToLastStanding(players);
    expect(dist.winners.length).toBe(1);
    expect(dist.winners[0].seat).toBe(0);
    expect(dist.winners[0].amount_won).toBe(100);
  });

  it('should collect bets into pot correctly', () => {
    const players = [
      makePlayer(0, { current_bet: 10, stack: 90 }),
      makePlayer(1, { current_bet: 10, stack: 90 }),
    ];
    const { newPot, players: updated } = collectBets(5, players);
    expect(newPot).toBe(25); // 5 existing + 10 + 10
    expect(updated[0].current_bet).toBe(0);
    expect(updated[1].current_bet).toBe(0);
  });
});
