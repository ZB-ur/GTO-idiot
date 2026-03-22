import { describe, it, expect } from 'vitest';
import { Deck } from '../../src/engine/deck';

describe('Deck', () => {
  it('should create a standard 52-card deck with no duplicates', () => {
    const deck = new Deck();
    const cards = deck.deal(52);
    expect(cards).toHaveLength(52);
    const unique = new Set(cards.map((c) => `${c.rank}${c.suit}`));
    expect(unique.size).toBe(52);
  });

  it('should shuffle deck with Fisher-Yates producing different orderings', () => {
    const deck1 = new Deck();
    const deck2 = new Deck();
    deck2.shuffle();
    const cards1 = deck1.deal(52).map((c) => `${c.rank}${c.suit}`);
    const cards2 = deck2.deal(52).map((c) => `${c.rank}${c.suit}`);
    const same = cards1.every((c, i) => c === cards2[i]);
    expect(same).toBe(false);
  });

  it('should deal N cards and reduce deck size accordingly', () => {
    const deck = new Deck();
    expect(deck.remaining()).toBe(52);
    const dealt = deck.deal(5);
    expect(dealt).toHaveLength(5);
    expect(deck.remaining()).toBe(47);
    const more = deck.deal(3);
    expect(more).toHaveLength(3);
    expect(deck.remaining()).toBe(44);
  });

  it('should throw when dealing more cards than remaining', () => {
    const deck = new Deck();
    deck.deal(50);
    expect(deck.remaining()).toBe(2);
    const dealt = deck.deal(5);
    // splice returns only what's available
    expect(dealt.length).toBeLessThanOrEqual(2);
    expect(deck.remaining()).toBe(0);
  });

  it('should produce statistically uniform distribution over many shuffles', () => {
    const positionCounts = new Map<string, number>();
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const deck = new Deck();
      deck.shuffle();
      const first = deck.deal(1)[0];
      const key = `${first.rank}${first.suit}`;
      positionCounts.set(key, (positionCounts.get(key) ?? 0) + 1);
    }
    const expected = iterations / 52;
    const tolerance = expected * 0.35;
    for (const [, count] of positionCounts) {
      expect(count).toBeGreaterThan(expected - tolerance);
      expect(count).toBeLessThan(expected + tolerance);
    }
  });
});
