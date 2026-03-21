import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands, HandRank, describeHand } from '../../src/engine/hand-evaluator';
import type { Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('Hand Evaluator', () => {
  it('should detect royal flush', () => {
    const cards = [
      c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'),
      c('J', 'spades'), c('T', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.RoyalFlush);
    expect(result.name).toBe('Royal Flush');
  });

  it('should detect straight flush', () => {
    const cards = [
      c('9', 'hearts'), c('8', 'hearts'), c('7', 'hearts'),
      c('6', 'hearts'), c('5', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
  });

  it('should detect four of a kind', () => {
    const cards = [
      c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'),
      c('K', 'clubs'), c('3', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FourOfAKind);
  });

  it('should detect full house', () => {
    const cards = [
      c('Q', 'spades'), c('Q', 'hearts'), c('Q', 'diamonds'),
      c('7', 'clubs'), c('7', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
  });

  it('should detect flush', () => {
    const cards = [
      c('A', 'hearts'), c('J', 'hearts'), c('8', 'hearts'),
      c('5', 'hearts'), c('2', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Flush);
  });

  it('should detect straight (including A-2-3-4-5 wheel)', () => {
    // Regular straight
    const straight = [
      c('9', 'spades'), c('8', 'hearts'), c('7', 'diamonds'),
      c('6', 'clubs'), c('5', 'spades'),
    ];
    expect(evaluateHand(straight).rank).toBe(HandRank.Straight);

    // Wheel
    const wheel = [
      c('A', 'spades'), c('2', 'hearts'), c('3', 'diamonds'),
      c('4', 'clubs'), c('5', 'spades'),
    ];
    const wheelResult = evaluateHand(wheel);
    expect(wheelResult.rank).toBe(HandRank.Straight);
  });

  it('should detect three of a kind', () => {
    const cards = [
      c('8', 'spades'), c('8', 'hearts'), c('8', 'diamonds'),
      c('K', 'clubs'), c('3', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.ThreeOfAKind);
  });

  it('should detect two pair', () => {
    const cards = [
      c('J', 'spades'), c('J', 'hearts'), c('4', 'diamonds'),
      c('4', 'clubs'), c('A', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.TwoPair);
  });

  it('should detect one pair', () => {
    const cards = [
      c('T', 'spades'), c('T', 'hearts'), c('A', 'diamonds'),
      c('7', 'clubs'), c('3', 'spades'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.OnePair);
  });

  it('should detect high card', () => {
    const cards = [
      c('A', 'spades'), c('J', 'hearts'), c('8', 'diamonds'),
      c('5', 'clubs'), c('2', 'hearts'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.HighCard);
  });

  it('should select best 5 from 7 cards', () => {
    const cards = [
      c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'),
      c('J', 'spades'), c('T', 'spades'), // royal flush
      c('2', 'hearts'), c('3', 'diamonds'), // irrelevant
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.RoyalFlush);
    expect(result.bestFive.length).toBe(5);
  });

  it('should correctly compare two hands of same rank (kicker logic)', () => {
    const pairKings = evaluateHand([
      c('K', 'spades'), c('K', 'hearts'), c('A', 'diamonds'),
      c('7', 'clubs'), c('3', 'spades'),
    ]);
    const pairQueens = evaluateHand([
      c('Q', 'spades'), c('Q', 'hearts'), c('A', 'diamonds'),
      c('7', 'clubs'), c('3', 'spades'),
    ]);
    expect(compareHands(pairKings, pairQueens)).toBeGreaterThan(0);

    // Same pair, different kicker
    const pairAcesHighKicker = evaluateHand([
      c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'),
      c('7', 'clubs'), c('3', 'spades'),
    ]);
    const pairAcesLowKicker = evaluateHand([
      c('A', 'diamonds'), c('A', 'clubs'), c('Q', 'hearts'),
      c('7', 'clubs'), c('3', 'spades'),
    ]);
    expect(compareHands(pairAcesHighKicker, pairAcesLowKicker)).toBeGreaterThan(0);
  });

  it('should handle tie (split pot scenario)', () => {
    const hand1 = evaluateHand([
      c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'),
      c('J', 'clubs'), c('9', 'spades'),
    ]);
    const hand2 = evaluateHand([
      c('A', 'hearts'), c('K', 'diamonds'), c('Q', 'clubs'),
      c('J', 'spades'), c('9', 'hearts'),
    ]);
    expect(compareHands(hand1, hand2)).toBe(0);
  });
});
