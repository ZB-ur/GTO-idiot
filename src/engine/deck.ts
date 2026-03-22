import type { Card, Rank, Suit } from '../types';
import { RANKS, SUITS } from '../types';

/**
 * Creates a standard 52-card deck.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle — mutates and returns the array.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Manages a shuffled deck with deal operations.
 */
export class Deck {
  private cards: Card[];
  private index: number;

  constructor() {
    this.cards = shuffleDeck(createDeck());
    this.index = 0;
  }

  /** Deal a single card from the top. */
  deal(): Card {
    if (this.index >= this.cards.length) {
      throw new Error('Deck exhausted — no more cards to deal');
    }
    return this.cards[this.index++];
  }

  /** Deal n cards. */
  dealMany(n: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < n; i++) {
      cards.push(this.deal());
    }
    return cards;
  }

  /** Burn one card (discard without revealing). */
  burn(): void {
    this.deal(); // just advance the pointer
  }

  /** Cards remaining in the deck. */
  get remaining(): number {
    return this.cards.length - this.index;
  }
}

/**
 * Utility: human-readable card notation, e.g. "Ah", "Ts".
 */
export function cardToString(card: Card): string {
  const suitChar: Record<Suit, string> = {
    hearts: 'h',
    diamonds: 'd',
    clubs: 'c',
    spades: 's',
  };
  return `${card.rank}${suitChar[card.suit]}`;
}

/**
 * Compare two cards by rank for sorting (Ace highest).
 */
export function rankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}
