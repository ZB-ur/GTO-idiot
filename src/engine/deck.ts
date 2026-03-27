import type { Card, Rank, Suit } from '../types';
import type { Deck } from './types';

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export function createDeck(): Deck {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  return { cards, nextIndex: 0 };
}

export function shuffleDeck(deck: Deck): Deck {
  const cards = [...deck.cards];
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return { cards, nextIndex: 0 };
}

export function dealCards(deck: Deck, count: number): { cards: Card[]; deck: Deck } {
  if (deck.nextIndex + count > deck.cards.length) {
    throw new Error(`Cannot deal ${count} cards: only ${deck.cards.length - deck.nextIndex} remaining`);
  }
  const dealt = deck.cards.slice(deck.nextIndex, deck.nextIndex + count);
  return {
    cards: dealt,
    deck: { ...deck, nextIndex: deck.nextIndex + count },
  };
}
