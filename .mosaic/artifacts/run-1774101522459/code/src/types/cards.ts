// ============================================================
// Card primitives — Rank, Suit, Card
// ============================================================

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export type Suit = 's' | 'h' | 'd' | 'c';

export interface Card {
  rank: Rank;
  suit: Suit;
}

/** Short string representation, e.g. "As", "Td" */
export type CardNotation = `${Rank}${Suit}`;

/** Hand combo notation for range tables, e.g. "AKs", "QJo", "TT" */
export type HandCombo = string;

// ============================================================
// Utility constants
// ============================================================

export const RANKS: readonly Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;

export const SUITS: readonly Suit[] = ['s', 'h', 'd', 'c'] as const;

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  s: 'black',
  h: 'red',
  d: 'red',
  c: 'black',
};

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/** Total cards in a standard deck */
export const DECK_SIZE = 52;

/** Convert Card to short notation */
export function cardToNotation(card: Card): CardNotation {
  return `${card.rank}${card.suit}` as CardNotation;
}

/** Parse short notation to Card */
export function notationToCard(notation: CardNotation): Card {
  return {
    rank: notation[0] as Rank,
    suit: notation[1] as Suit,
  };
}
