// ============================================================
// GTO Idiot — Deck: Shuffle, deal, and card utilities
// ============================================================

import type { Card, Rank, Suit } from '../types';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/** Numeric rank value for comparison (2=2 … A=14) */
export function rankValue(rank: Rank): number {
  const map: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return map[rank];
}

/** Short notation: "As" for Ace of spades, "Th" for Ten of hearts */
const SUIT_CHAR: Record<Suit, string> = {
  hearts: 'h', diamonds: 'd', clubs: 'c', spades: 's',
};

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_CHAR[card.suit]}`;
}

export function cardsToString(cards: Card[]): string {
  return cards.map(cardToString).join(' ');
}

/** Compare two cards for equality */
export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/** Build the full 52-card deck */
function buildFullDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle (in-place, crypto-grade randomness when available).
 */
function shuffleInPlace(arr: Card[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Get a random integer in [0, max) using crypto API if available */
function cryptoRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

// ============================================================
// Deck class
// ============================================================

export class Deck {
  private cards: Card[];
  private cursor: number;

  constructor() {
    this.cards = buildFullDeck();
    this.cursor = 0;
    this.shuffle();
  }

  /** Shuffle and reset the deck */
  shuffle(): void {
    this.cards = buildFullDeck();
    shuffleInPlace(this.cards);
    this.cursor = 0;
  }

  /** Deal n cards from the top */
  deal(n: number): Card[] {
    if (this.cursor + n > this.cards.length) {
      throw new Error(`Cannot deal ${n} cards — only ${this.remaining} left`);
    }
    const dealt = this.cards.slice(this.cursor, this.cursor + n);
    this.cursor += n;
    return dealt;
  }

  /** Deal a single card */
  dealOne(): Card {
    return this.deal(1)[0];
  }

  /** Remaining cards in the deck */
  get remaining(): number {
    return this.cards.length - this.cursor;
  }

  /**
   * Remove specific cards from the deck (used when cards are already known).
   * Must be called before dealing.
   */
  removeCards(cards: Card[]): void {
    this.cards = this.cards.filter(
      (c) => !cards.some((rem) => cardsEqual(c, rem)),
    );
    // Re-shuffle the remaining cards
    shuffleInPlace(this.cards);
    this.cursor = 0;
  }
}

export { RANKS, SUITS };
