// ============================================================
// GTO Idiot — 7-Card Hand Evaluator
// Evaluates the best 5-card poker hand from up to 7 cards.
// ============================================================

import type { Card, Rank } from '../types';
import { rankValue } from './deck';

// Hand rankings (higher = better)
export enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export const HAND_RANK_NAMES: Record<HandRank, string> = {
  [HandRank.HighCard]: 'High Card',
  [HandRank.OnePair]: 'One Pair',
  [HandRank.TwoPair]: 'Two Pair',
  [HandRank.ThreeOfAKind]: 'Three of a Kind',
  [HandRank.Straight]: 'Straight',
  [HandRank.Flush]: 'Flush',
  [HandRank.FullHouse]: 'Full House',
  [HandRank.FourOfAKind]: 'Four of a Kind',
  [HandRank.StraightFlush]: 'Straight Flush',
  [HandRank.RoyalFlush]: 'Royal Flush',
};

export interface EvaluatedHand {
  /** Hand ranking category */
  rank: HandRank;
  /** Human-readable name */
  name: string;
  /**
   * Numeric score for comparison. Higher is better.
   * Encodes rank category + kickers for total ordering.
   */
  score: number;
  /** The best 5 cards used */
  bestFive: Card[];
}

// ============================================================
// Core evaluation
// ============================================================

/**
 * Evaluate the best 5-card hand from 2-7 cards.
 * Uses combinatorial enumeration of all C(n,5) subsets.
 */
export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length < 5) {
    throw new Error(`Need at least 5 cards, got ${cards.length}`);
  }

  if (cards.length === 5) {
    return evaluate5(cards);
  }

  // Generate all C(n,5) combinations and pick the best
  const combos = combinations(cards, 5);
  let best: EvaluatedHand | null = null;

  for (const combo of combos) {
    const evaluated = evaluate5(combo);
    if (!best || evaluated.score > best.score) {
      best = evaluated;
    }
  }

  return best!;
}

/**
 * Compare two evaluated hands. Returns:
 *  > 0 if a wins, < 0 if b wins, 0 if tie
 */
export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  return a.score - b.score;
}

// ============================================================
// Internal: evaluate exactly 5 cards
// ============================================================

function evaluate5(cards: Card[]): EvaluatedHand {
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const isFlush = cards.every((c) => c.suit === cards[0].suit);
  const isStraight = checkStraight(values);

  // Check for wheel (A-2-3-4-5)
  const isWheel = checkWheel(values);
  const straightHigh = isWheel ? 5 : values[0];

  // Count rank occurrences
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  const groups = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const pattern = groups.map((g) => g[1]).join('');

  let rank: HandRank;
  let score: number;

  if ((isStraight || isWheel) && isFlush) {
    rank = straightHigh === 14 && !isWheel ? HandRank.RoyalFlush : HandRank.StraightFlush;
    score = makeScore(rank, [straightHigh]);
  } else if (pattern === '41') {
    rank = HandRank.FourOfAKind;
    score = makeScore(rank, [groups[0][0], groups[1][0]]);
  } else if (pattern === '32') {
    rank = HandRank.FullHouse;
    score = makeScore(rank, [groups[0][0], groups[1][0]]);
  } else if (isFlush) {
    rank = HandRank.Flush;
    score = makeScore(rank, values);
  } else if (isStraight || isWheel) {
    rank = HandRank.Straight;
    score = makeScore(rank, [straightHigh]);
  } else if (pattern === '311') {
    rank = HandRank.ThreeOfAKind;
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a);
    score = makeScore(rank, [groups[0][0], ...kickers]);
  } else if (pattern === '221') {
    rank = HandRank.TwoPair;
    const pairs = groups.filter((g) => g[1] === 2).map((g) => g[0]).sort((a, b) => b - a);
    const kicker = groups.find((g) => g[1] === 1)![0];
    score = makeScore(rank, [...pairs, kicker]);
  } else if (pattern === '2111') {
    rank = HandRank.OnePair;
    const pairVal = groups[0][0];
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a);
    score = makeScore(rank, [pairVal, ...kickers]);
  } else {
    rank = HandRank.HighCard;
    score = makeScore(rank, values);
  }

  return {
    rank,
    name: HAND_RANK_NAMES[rank],
    score,
    bestFive: cards,
  };
}

/** Check if sorted-descending values form a straight */
function checkStraight(values: number[]): boolean {
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) return false;
  }
  return true;
}

/** Check for wheel: A-5-4-3-2 (values sorted desc: [14, 5, 4, 3, 2]) */
function checkWheel(values: number[]): boolean {
  return (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  );
}

/**
 * Encode hand rank + kicker values into a single comparable number.
 * Uses base-15 encoding for up to 5 kicker slots.
 */
function makeScore(rank: HandRank, kickers: number[]): number {
  let score = rank * 15 ** 5; // Category takes the highest significance
  for (let i = 0; i < kickers.length && i < 5; i++) {
    score += kickers[i] * 15 ** (4 - i);
  }
  return score;
}

// ============================================================
// Combinations generator
// ============================================================

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const combo: T[] = [];

  function backtrack(start: number): void {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1);
      combo.pop();
    }
  }

  backtrack(0);
  return result;
}

// ============================================================
// Utility: hand description with high card info
// ============================================================

const RANK_NAMES: Record<Rank, string> = {
  '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
  '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
  'T': 'Ten', 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
};

/** Get a descriptive string like "Two Pair, Kings and Sevens" */
export function describeHand(evaluated: EvaluatedHand): string {
  const cards = evaluated.bestFive;
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const counts = new Map<number, Rank[]>();
  for (const c of cards) {
    const v = rankValue(c.rank);
    if (!counts.has(v)) counts.set(v, []);
    counts.get(v)!.push(c.rank);
  }

  const groups = [...counts.entries()].sort((a, b) => b[1].length - a[1].length || b[0] - a[0]);

  switch (evaluated.rank) {
    case HandRank.RoyalFlush:
      return 'Royal Flush';
    case HandRank.StraightFlush:
      return `Straight Flush, ${RANK_NAMES[groups[0][1][0]]} high`;
    case HandRank.FourOfAKind:
      return `Four of a Kind, ${RANK_NAMES[groups[0][1][0]]}s`;
    case HandRank.FullHouse:
      return `Full House, ${RANK_NAMES[groups[0][1][0]]}s full of ${RANK_NAMES[groups[1][1][0]]}s`;
    case HandRank.Flush:
      return `Flush, ${RANK_NAMES[valToRank(values[0])]} high`;
    case HandRank.Straight:
      return `Straight, ${RANK_NAMES[valToRank(values[0])]} high`;
    case HandRank.ThreeOfAKind:
      return `Three of a Kind, ${RANK_NAMES[groups[0][1][0]]}s`;
    case HandRank.TwoPair: {
      const p = groups.filter((g) => g[1].length === 2).sort((a, b) => b[0] - a[0]);
      return `Two Pair, ${RANK_NAMES[p[0][1][0]]}s and ${RANK_NAMES[p[1][1][0]]}s`;
    }
    case HandRank.OnePair:
      return `Pair of ${RANK_NAMES[groups[0][1][0]]}s`;
    case HandRank.HighCard:
      return `High Card, ${RANK_NAMES[valToRank(values[0])]}`;
  }
}

function valToRank(val: number): Rank {
  const map: Record<number, Rank> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8',
    9: '9', 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
  };
  return map[val];
}
