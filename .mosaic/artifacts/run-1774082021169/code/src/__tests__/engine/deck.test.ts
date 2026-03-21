import { describe, it, expect } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  dealCard,
  dealCards,
  remainingCards,
  createPartialDeck,
} from '../../engine/deck';
import { createCard } from '../../engine/utils';

describe('Deck', () => {
  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      const deck = createDeck();
      expect(deck.cards).toHaveLength(52);
      expect(deck.position).toBe(0);
    });

    it('should contain all unique cards', () => {
      const deck = createDeck();
      const notations = deck.cards.map(c => c.notation);
      const unique = new Set(notations);
      expect(unique.size).toBe(52);
    });

    it('should contain all 4 suits for each rank', () => {
      const deck = createDeck();
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      const suits = ['s', 'h', 'd', 'c'];

      for (const rank of ranks) {
        for (const suit of suits) {
          const found = deck.cards.find(c => c.rank === rank && c.suit === suit);
          expect(found).toBeDefined();
        }
      }
    });

    it('should have proper card notation', () => {
      const deck = createDeck();
      for (const card of deck.cards) {
        expect(card.notation).toBe(`${card.rank}${card.suit}`);
      }
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with 52 cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled.cards).toHaveLength(52);
    });

    it('should reset position to 0', () => {
      const deck = createDeck();
      deck.position = 10;
      const shuffled = shuffleDeck(deck);
      expect(shuffled.position).toBe(0);
    });

    it('should contain all the same cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const originalNotations = [...deck.cards.map(c => c.notation)].sort();
      const shuffledNotations = [...shuffled.cards.map(c => c.notation)].sort();
      expect(shuffledNotations).toEqual(originalNotations);
    });

    it('should produce a different order (probabilistic)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      // Extremely unlikely for a shuffled deck to be in the same order
      const sameOrder = deck.cards.every((c, i) => c.notation === shuffled.cards[i]?.notation);
      expect(sameOrder).toBe(false);
    });
  });

  describe('dealCard', () => {
    it('should deal the top card and advance position', () => {
      const deck = createDeck();
      const firstCard = deck.cards[0]!;
      const dealt = dealCard(deck);
      expect(dealt.notation).toBe(firstCard.notation);
      expect(deck.position).toBe(1);
    });

    it('should deal consecutive cards', () => {
      const deck = createDeck();
      const card1 = dealCard(deck);
      const card2 = dealCard(deck);
      expect(card1.notation).not.toBe(card2.notation);
      expect(deck.position).toBe(2);
    });

    it('should throw when deck is exhausted', () => {
      const deck = createDeck();
      deck.position = 52;
      expect(() => dealCard(deck)).toThrow('Deck exhausted');
    });
  });

  describe('dealCards', () => {
    it('should deal the specified number of cards', () => {
      const deck = createDeck();
      const cards = dealCards(deck, 5);
      expect(cards).toHaveLength(5);
      expect(deck.position).toBe(5);
    });

    it('should deal unique cards', () => {
      const deck = shuffleDeck(createDeck());
      const cards = dealCards(deck, 10);
      const notations = new Set(cards.map(c => c.notation));
      expect(notations.size).toBe(10);
    });
  });

  describe('remainingCards', () => {
    it('should return 52 for a fresh deck', () => {
      const deck = createDeck();
      expect(remainingCards(deck)).toBe(52);
    });

    it('should decrease as cards are dealt', () => {
      const deck = createDeck();
      dealCards(deck, 7);
      expect(remainingCards(deck)).toBe(45);
    });
  });

  describe('createPartialDeck', () => {
    it('should exclude specified cards', () => {
      const excluded = [createCard('A', 's'), createCard('K', 'h')];
      const partial = createPartialDeck(excluded);
      expect(partial.cards).toHaveLength(50);

      const hasAceSpades = partial.cards.some(c => c.notation === 'As');
      const hasKingHearts = partial.cards.some(c => c.notation === 'Kh');
      expect(hasAceSpades).toBe(false);
      expect(hasKingHearts).toBe(false);
    });

    it('should start at position 0', () => {
      const partial = createPartialDeck([createCard('2', 's')]);
      expect(partial.position).toBe(0);
    });

    it('should return 52 cards when no exclusions', () => {
      const partial = createPartialDeck([]);
      expect(partial.cards).toHaveLength(52);
    });
  });
});
