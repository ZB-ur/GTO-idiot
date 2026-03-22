import { describe, it, expect } from 'vitest';
import { HandEvaluator } from '../../src/engine/hand-evaluator';
import type { Card } from '../../src/types';

function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('HandEvaluator', () => {
  const ev = new HandEvaluator();

  it('should identify Royal Flush', () => {
    const r = ev.evaluate([c('A','s'), c('K','s')], [c('Q','s'), c('J','s'), c('T','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('royal_flush');
  });

  it('should identify Straight Flush', () => {
    const r = ev.evaluate([c('9','h'), c('8','h')], [c('7','h'), c('6','h'), c('5','h'), c('2','d'), c('3','c')]);
    expect(r.rank).toBe('straight_flush');
  });

  it('should identify Four of a Kind', () => {
    const r = ev.evaluate([c('K','s'), c('K','h')], [c('K','d'), c('K','c'), c('5','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('four_of_a_kind');
  });

  it('should identify Full House', () => {
    const r = ev.evaluate([c('Q','s'), c('Q','h')], [c('Q','d'), c('J','c'), c('J','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('full_house');
  });

  it('should identify Flush', () => {
    const r = ev.evaluate([c('A','d'), c('J','d')], [c('8','d'), c('5','d'), c('3','d'), c('K','s'), c('2','c')]);
    expect(r.rank).toBe('flush');
  });

  it('should identify Straight including A-5 wheel', () => {
    const r = ev.evaluate([c('A','s'), c('2','h')], [c('3','d'), c('4','c'), c('5','s'), c('9','h'), c('K','d')]);
    expect(r.rank).toBe('straight');
    expect(r.description).toContain('Five');
  });

  it('should identify Three of a Kind', () => {
    const r = ev.evaluate([c('7','s'), c('7','h')], [c('7','d'), c('K','c'), c('2','s'), c('9','h'), c('4','d')]);
    expect(r.rank).toBe('three_of_a_kind');
  });

  it('should identify Two Pair', () => {
    const r = ev.evaluate([c('A','s'), c('K','h')], [c('A','d'), c('K','c'), c('5','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('two_pair');
  });

  it('should identify One Pair', () => {
    const r = ev.evaluate([c('A','s'), c('Q','h')], [c('A','d'), c('9','c'), c('5','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('one_pair');
  });

  it('should identify High Card', () => {
    const r = ev.evaluate([c('A','s'), c('J','h')], [c('8','d'), c('6','c'), c('4','s'), c('3','h'), c('2','d')]);
    expect(r.rank).toBe('high_card');
  });

  it('should select best 5 cards from 7', () => {
    const r = ev.evaluate([c('A','s'), c('K','s')], [c('Q','s'), c('J','s'), c('T','s'), c('3','h'), c('2','d')]);
    expect(r.bestFiveCards).toHaveLength(5);
    expect(r.rank).toBe('royal_flush');
  });

  it('should correctly compare two hands and determine winner', () => {
    const community = [c('A','d'), c('K','d'), c('8','s'), c('5','h'), c('2','c')];
    const hands = [
      { playerId: 'p1', holeCards: [c('A','s'), c('Q','h')] },
      { playerId: 'p2', holeCards: [c('K','s'), c('J','h')] },
    ];
    const result = ev.compareHands(hands, community);
    expect(result.winners).toEqual(['p1']);
  });

  it('should detect a split pot with tied hands', () => {
    const community = [c('A','d'), c('K','d'), c('Q','s'), c('J','h'), c('T','c')];
    const hands = [
      { playerId: 'p1', holeCards: [c('2','s'), c('3','h')] },
      { playerId: 'p2', holeCards: [c('4','s'), c('5','h')] },
    ];
    const result = ev.compareHands(hands, community);
    expect(result.winners).toContain('p1');
    expect(result.winners).toContain('p2');
  });

  it('should evaluate within 1ms for a single hand', () => {
    const hole = [c('A','s'), c('K','h')];
    const comm = [c('Q','d'), c('J','c'), c('T','s'), c('3','h'), c('2','d')];
    const start = performance.now();
    ev.evaluate(hole, comm);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1);
  });
});
