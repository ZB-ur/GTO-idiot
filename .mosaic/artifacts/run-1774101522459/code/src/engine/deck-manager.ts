// ============================================================
// DeckManager — Shuffle, deal, and manage a 52-card deck
// ============================================================

import type { Card } from '../types';
import { RANKS, SUITS } from '../types';

/**
 * Fisher-Yates shuffle using crypto-grade randomness when available.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a random integer in [0, max) using crypto API if available.
 */
function cryptoRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Build a fresh 52-card deck in canonical order.
 */
function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export class DeckManager {
  private cards: Card[] = [];
  private dealIndex = 0;

  /** Create a new shuffled deck. */
  shuffle(): void {
    this.cards = fisherYatesShuffle(buildDeck());
    this.dealIndex = 0;
  }

  /** Deal the next card from the deck. Throws if exhausted. */
  deal(): Card {
    if (this.dealIndex >= this.cards.length) {
      throw new Error('Deck exhausted: no more cards to deal');
    }
    return this.cards[this.dealIndex++];
  }

  /** Deal multiple cards at once. */
  dealMany(count: number): Card[] {
    const result: Card[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.deal());
    }
    return result;
  }

  /** Burn a card (deal and discard). */
  burn(): void {
    this.deal();
  }

  /** Number of cards remaining in the deck. */
  get remaining(): number {
    return this.cards.length - this.dealIndex;
  }
}
