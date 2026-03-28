/**
 * Deck management — creation, shuffling, and dealing.
 * Uses Fisher-Yates shuffle with crypto.getRandomValues for fairness.
 */

import type { Card } from '../types/card';
import { RANKS, SUITS } from '../types/card';
import { createCard } from './utils';

/** A standard 52-card deck */
export interface Deck {
  readonly cards: Card[];
  position: number; // index of next card to deal
}

/** Create a fresh, ordered 52-card deck */
export function createDeck(): Deck {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(rank, suit));
    }
  }
  return { cards, position: 0 };
}

/**
 * Fisher-Yates shuffle using crypto-secure random values.
 * Returns a new shuffled deck ready for dealing.
 */
export function shuffleDeck(deck: Deck): Deck {
  const cards = [...deck.cards];
  const n = cards.length;

  // Use crypto.getRandomValues for unbiased randomness
  const randomValues = new Uint32Array(n);
  crypto.getRandomValues(randomValues);

  for (let i = n - 1; i > 0; i--) {
    // Unbiased modulo: j in [0, i]
    const j = randomValues[i]! % (i + 1);
    const temp = cards[i]!;
    cards[i] = cards[j]!;
    cards[j] = temp;
  }

  return { cards, position: 0 };
}

/** Deal one card from the deck, advancing the position */
export function dealCard(deck: Deck): Card {
  if (deck.position >= deck.cards.length) {
    throw new Error('Deck exhausted: no more cards to deal');
  }
  const card = deck.cards[deck.position]!;
  deck.position++;
  return card;
}

/** Deal N cards from the deck */
export function dealCards(deck: Deck, count: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    cards.push(dealCard(deck));
  }
  return cards;
}

/** Get the number of remaining cards in the deck */
export function remainingCards(deck: Deck): number {
  return deck.cards.length - deck.position;
}

/**
 * Create a deck with specific cards removed (for simulations).
 * Useful for Monte Carlo equity calculations where known cards are excluded.
 */
export function createPartialDeck(excludeCards: readonly Card[]): Deck {
  const excluded = new Set(excludeCards.map(c => c.notation));
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const notation = `${rank}${suit}`;
      if (!excluded.has(notation)) {
        cards.push(createCard(rank, suit));
      }
    }
  }

  return { cards, position: 0 };
}
