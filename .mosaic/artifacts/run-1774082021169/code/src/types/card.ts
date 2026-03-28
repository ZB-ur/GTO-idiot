/** Card rank values */
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

/** Card suit: s=spades, h=hearts, d=diamonds, c=clubs */
export type Suit = 's' | 'h' | 'd' | 'c';

/** A single playing card */
export interface Card {
  readonly rank: Rank;
  readonly suit: Suit;
  /** Short notation, e.g. 'Ah', 'Ks' */
  readonly notation: string;
}

/** A pair of hole cards dealt to a player */
export interface HoleCards {
  readonly card1: Card;
  readonly card2: Card;
}

/** Numeric rank values for comparison (2=2, ..., A=14) */
export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
} as const;

/** All ranks in ascending order */
export const RANKS: readonly Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;

/** All suits */
export const SUITS: readonly Suit[] = ['s', 'h', 'd', 'c'] as const;

/** Suit display symbols for UI rendering */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
} as const;

/** Suit CSS color classes */
export const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-blue-400',
  c: 'text-green-400',
} as const;
