/**
 * Engine utility functions — pure helpers for poker logic.
 */

import type { Card, Rank, Suit } from '../types/card';
import { RANK_VALUES, RANKS, SUITS } from '../types/card';
import type { Position } from '../types/game';
import { POSITIONS } from '../types/game';

/** Generate a UUID v4 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Create a Card object from rank and suit */
export function createCard(rank: Rank, suit: Suit): Card {
  return { rank, suit, notation: `${rank}${suit}` };
}

/** Parse a card notation string (e.g. "Ah") into a Card */
export function parseCard(notation: string): Card {
  if (notation.length !== 2) {
    throw new Error(`Invalid card notation: ${notation}`);
  }
  const rank = notation[0] as Rank;
  const suit = notation[1] as Suit;
  if (!RANKS.includes(rank)) {
    throw new Error(`Invalid rank: ${rank}`);
  }
  if (!SUITS.includes(suit)) {
    throw new Error(`Invalid suit: ${suit}`);
  }
  return createCard(rank, suit);
}

/** Get the numeric value of a rank (2=2, ..., A=14) */
export function rankValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

/** Compare two cards by rank value (descending). Returns negative if a > b. */
export function compareCards(a: Card, b: Card): number {
  return rankValue(b.rank) - rankValue(a.rank);
}

/** Check if two cards are the same */
export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

/** Get the next position in dealing order after the given position */
export function nextPosition(position: Position): Position {
  const idx = POSITIONS.indexOf(position);
  return POSITIONS[(idx + 1) % POSITIONS.length]!;
}

/** Get the position N seats after the given position */
export function positionAfter(position: Position, n: number): Position {
  const idx = POSITIONS.indexOf(position);
  return POSITIONS[(idx + n) % POSITIONS.length]!;
}

/**
 * Get preflop action order starting from UTG.
 * Preflop: UTG, MP, CO, BTN, SB, BB
 * Postflop: SB, BB, UTG, MP, CO, BTN
 */
export function getActionOrder(dealerPosition: Position, isPreflop: boolean): Position[] {
  const dealerIdx = POSITIONS.indexOf(dealerPosition);

  if (isPreflop) {
    // Preflop: start from UTG (dealer + 3), wrap around. SB and BB act last.
    const order: Position[] = [];
    for (let i = 0; i < 6; i++) {
      // UTG is 3 after dealer in 6-max
      order.push(POSITIONS[(dealerIdx + 3 + i) % 6]!);
    }
    return order;
  }

  // Postflop: start from SB (dealer + 1)
  const order: Position[] = [];
  for (let i = 0; i < 6; i++) {
    order.push(POSITIONS[(dealerIdx + 1 + i) % 6]!);
  }
  return order;
}

/** Clamp a number to a min/max range */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round to N decimal places */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Get current ISO timestamp */
export function now(): string {
  return new Date().toISOString();
}
