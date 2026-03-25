import type { Card, DeckState } from '../types';
import { RANKS, SUITS } from '../types';

export function createDeck(): DeckState {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  return { cards, dealtCount: 0 };
}

export function shuffle(deck: DeckState): DeckState {
  const cards = [...deck.cards];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return { cards, dealtCount: 0 };
}

export function deal(deck: DeckState, count: number): { cards: Card[]; deck: DeckState } {
  const dealt = deck.cards.slice(deck.dealtCount, deck.dealtCount + count);
  return {
    cards: dealt,
    deck: {
      cards: deck.cards,
      dealtCount: deck.dealtCount + count,
    },
  };
}
