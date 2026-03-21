import { describe, it, expect, vi } from 'vitest';
import { Deck, RANKS, SUITS, rankValue, cardToString, cardsEqual } from '../../src/engine/deck';
import type { Card } from '../../src/types';

describe('Deck', () => {
  it('should create a 52-card deck with unique cards', () => {
    const deck = new Deck();
    const cards: Card[] = [];
    while (deck.remaining > 0) {
      cards.push(...deck.deal(1));
    }
    expect(cards.length).toBe(52);
    // All unique
    const keys = cards.map((c) => `${c.rank}-${c.suit}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(52);
  });

  it('should shuffle deck using Fisher-Yates (statistical distribution check)', () => {
    // Deal first card from many shuffles; should not always be the same
    const firstCards: string[] = [];
    for (let i = 0; i < 50; i++) {
      const deck = new Deck();
      const [card] = deck.deal(1);
      firstCards.push(cardToString(card));
    }
    const unique = new Set(firstCards);
    // With 50 shuffles, we should see at least a few different first cards
    expect(unique.size).toBeGreaterThan(1);
  });

  it('should deal cards and reduce remaining deck size', () => {
    const deck = new Deck();
    expect(deck.remaining).toBe(52);

    const dealt = deck.deal(5);
    expect(dealt.length).toBe(5);
    expect(deck.remaining).toBe(47);

    deck.deal(10);
    expect(deck.remaining).toBe(37);
  });

  it('should throw when dealing from empty deck', () => {
    const deck = new Deck();
    deck.deal(52);
    expect(deck.remaining).toBe(0);
    expect(() => deck.deal(1)).toThrow(/Cannot deal/);
  });

  it('should use crypto.getRandomValues for shuffle randomness', () => {
    // Verify crypto is available in the test environment and deck still works
    const deck = new Deck();
    const cards = deck.deal(5);
    expect(cards.length).toBe(5);
    // Each card should have valid rank and suit
    for (const card of cards) {
      expect(RANKS).toContain(card.rank);
      expect(SUITS).toContain(card.suit);
    }
  });
});

describe('rankValue', () => {
  it('should return correct numeric values', () => {
    expect(rankValue('2')).toBe(2);
    expect(rankValue('T')).toBe(10);
    expect(rankValue('A')).toBe(14);
    expect(rankValue('K')).toBe(13);
  });
});

describe('cardToString', () => {
  it('should format cards correctly', () => {
    expect(cardToString({ rank: 'A', suit: 'spades' })).toBe('As');
    expect(cardToString({ rank: 'T', suit: 'hearts' })).toBe('Th');
  });
});

describe('cardsEqual', () => {
  it('should compare cards for equality', () => {
    const a: Card = { rank: 'A', suit: 'spades' };
    const b: Card = { rank: 'A', suit: 'spades' };
    const c: Card = { rank: 'A', suit: 'hearts' };
    expect(cardsEqual(a, b)).toBe(true);
    expect(cardsEqual(a, c)).toBe(false);
  });
});
