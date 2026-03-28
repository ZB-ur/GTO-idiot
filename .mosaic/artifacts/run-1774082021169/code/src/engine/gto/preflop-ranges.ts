/**
 * GTO preflop range definitions and hand categorization.
 *
 * 169 canonical hand combos organized into action ranges per position
 * and facing-action context. This module defines the range structure;
 * actual data lives in preflop-data.json, and lookups in preflop-lookup.ts.
 */

import type { Rank, HoleCards } from '../../types/card';
import type { Position } from '../../types/game';
import type { FacingAction } from '../../types/gto';

/** GTO action frequencies for a specific hand in a specific spot */
export interface GTORangeEntry {
  /** Canonical hand notation, e.g. "AKs", "TT", "87o" */
  readonly hand: string;
  /** Raise/bet frequency (0-1) */
  readonly raiseFreq: number;
  /** Call frequency (0-1) */
  readonly callFreq: number;
  /** Fold frequency = 1 - raiseFreq - callFreq */
}

/** A complete range table for one position + facing-action spot */
export interface GTORangeTable {
  readonly position: Position;
  readonly facingAction: FacingAction;
  readonly raiserPosition?: Position;
  readonly entries: readonly GTORangeEntry[];
}

/** Hand category for display purposes */
export type HandCategory =
  | 'Premium'
  | 'Strong Broadway'
  | 'Broadway'
  | 'Medium Pair'
  | 'Small Pair'
  | 'Suited Connector'
  | 'Suited Gapper'
  | 'Suited Ace'
  | 'Offsuit Connector'
  | 'Trash';

/**
 * Canonical hand strength ordering — 169 unique starting hand combos.
 * Indexed from strongest (0) to weakest.
 */
export const HAND_STRENGTH_ORDER: readonly string[] = [
  // Tier 1: Premium
  'AA', 'KK', 'QQ', 'AKs',
  // Tier 2: Strong
  'JJ', 'AKo', 'AQs', 'TT',
  // Tier 3: Good
  'AQo', 'AJs', '99', 'KQs', 'ATs', '88', 'KJs', 'AJo',
  // Tier 4: Playable
  'KTs', 'QJs', 'ATo', 'KQo', '77', 'QTs', 'A9s', 'JTs', 'KJo',
  'A8s', '66', 'K9s', 'QJo', 'A7s', 'A5s',
  // Tier 5: Speculative
  'T9s', 'A6s', '55', 'A4s', 'KTo', 'J9s', 'QTo', 'A3s', 'A2s',
  'K8s', 'Q9s', 'JTo', 'T8s', '98s', '44',
  // Tier 6: Marginal
  'K7s', 'J8s', 'Q8s', 'K6s', 'T7s', '87s', '97s', '33', 'K5s',
  'K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', '76s', '86s', 'J7s', '22',
  '65s', '96s', 'A9o', '54s', 'T6s', '75s',
  // Tier 7: Weak
  'Q5s', 'Q4s', 'Q3s', 'Q2s', '64s', 'J6s', 'J5s', 'J4s', 'J3s',
  'J2s', '85s', '53s', 'T5s', 'T4s', 'T3s', 'T2s', '43s', '74s',
  '95s', '84s', '63s', '94s', '93s', '92s', 'K9o', 'J9o', 'T9o',
  // Tier 8: Trash
  '52s', '42s', '32s', '73s', '62s', '83s', '82s', '72s', 'A8o',
  'K8o', 'Q9o', 'J8o', 'T8o', '98o', '87o', '76o', '65o', '54o',
  'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'K7o', 'K6o', 'K5o',
  'K4o', 'K3o', 'K2o', 'Q8o', 'Q7o', 'Q6o', 'Q5o', 'Q4o', 'Q3o',
  'Q2o', 'J7o', 'J6o', 'J5o', 'J4o', 'J3o', 'J2o', 'T7o', 'T6o',
  'T5o', 'T4o', 'T3o', 'T2o', '97o', '96o', '95o', '94o', '93o',
  '92o', '86o', '85o', '84o', '83o', '82o', '75o', '74o', '73o',
  '72o', '64o', '63o', '62o', '53o', '52o', '43o', '42o', '32o',
] as const;

const RANK_ORDER: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Convert hole cards to canonical hand notation.
 * e.g. Ah Ks → "AKs", Ah Kd → "AKo", Ah Ad → "AA"
 */
export function toCanonicalNotation(holeCards: HoleCards): string {
  const r1 = holeCards.card1.rank;
  const r2 = holeCards.card2.rank;
  const suited = holeCards.card1.suit === holeCards.card2.suit;

  const [high, low] = RANK_ORDER[r1] >= RANK_ORDER[r2] ? [r1, r2] : [r2, r1];

  if (high === low) return `${high}${low}`;
  return `${high}${low}${suited ? 's' : 'o'}`;
}

/**
 * Classify a hand into a human-readable category.
 */
export function classifyHand(notation: string): HandCategory {
  const isPair = notation.length === 2 || (notation.length === 3 && notation[0] === notation[1]);
  const isSuited = notation.endsWith('s');
  const rank1 = notation[0]!;
  const rank2 = notation[1]!;

  if (isPair) {
    const val = RANK_ORDER[rank1 as Rank] ?? 0;
    if (val >= 11) return 'Premium'; // JJ+
    if (val >= 7) return 'Medium Pair'; // 77-TT
    return 'Small Pair'; // 22-66
  }

  const val1 = RANK_ORDER[rank1 as Rank] ?? 0;
  const val2 = RANK_ORDER[rank2 as Rank] ?? 0;
  const gap = val1 - val2;

  // Check for premium broadway
  if (val1 >= 13 && val2 >= 13) return 'Premium'; // AK

  // Broadway: both T+
  if (val1 >= 10 && val2 >= 10) {
    return val1 >= 12 ? 'Strong Broadway' : 'Broadway';
  }

  // Suited Ace
  if (rank1 === 'A' && isSuited) return 'Suited Ace';

  // Connectors / gappers
  if (isSuited) {
    if (gap === 1) return 'Suited Connector';
    if (gap <= 3) return 'Suited Gapper';
  }

  if (!isSuited && gap === 1 && val1 >= 5) return 'Offsuit Connector';

  return 'Trash';
}

/**
 * Get the hand strength percentile (0 = strongest, 100 = weakest).
 */
export function getHandPercentile(notation: string): number {
  const idx = HAND_STRENGTH_ORDER.indexOf(notation);
  if (idx === -1) return 100;
  return (idx / HAND_STRENGTH_ORDER.length) * 100;
}
