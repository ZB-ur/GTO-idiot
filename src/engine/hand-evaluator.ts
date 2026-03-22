import type { Card } from '../types';
import { rankValue } from './deck';

/** Hand ranking categories from lowest (0) to highest (9). */
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

export interface EvaluatedHand {
  rank: HandRank;
  /** Kicker values for tie-breaking, highest first. */
  kickers: number[];
  /** Human-readable description. */
  description: string;
  /** The best 5 cards making up the hand. */
  bestCards: Card[];
}

/**
 * Evaluate the best 5-card hand from 7 cards (2 hole + 5 community).
 * Uses brute-force combination approach (C(7,5) = 21 combos).
 */
export function evaluateHand(holeCards: [Card, Card], communityCards: Card[]): EvaluatedHand {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    // For partial boards, evaluate what we have
    return evaluate5(allCards.length >= 5 ? allCards.slice(0, 5) : padToFive(allCards));
  }

  const combos = combinations(allCards, 5);
  let best: EvaluatedHand | null = null;

  for (const combo of combos) {
    const evaluated = evaluate5(combo);
    if (!best || compareHands(evaluated, best) > 0) {
      best = evaluated;
    }
  }

  return best!;
}

/**
 * Compare two evaluated hands. Returns >0 if a wins, <0 if b wins, 0 if tie.
 */
export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

/**
 * Get a simple hand strength description for UI display.
 */
export function getHandDescription(hand: EvaluatedHand): string {
  return hand.description;
}

// ─── Internal helpers ───────────────────────────────────────────

function padToFive(cards: Card[]): Card[] {
  // If fewer than 5 cards, just evaluate what we have
  // This is only used for partial board display
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  return sorted;
}

function evaluate5(cards: Card[]): EvaluatedHand {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const values = sorted.map(c => rankValue(c.rank));

  const isFlush = cards.length === 5 && new Set(cards.map(c => c.suit)).size === 1;
  const isStraight = checkStraight(values);
  const isLowStraight = checkLowStraight(values);

  // Count rank frequencies
  const freq = new Map<number, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  const groups = [...freq.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // by count desc
    return b[0] - a[0]; // by rank desc
  });

  // Royal Flush
  if (isFlush && isStraight && values[0] === 14) {
    return { rank: HandRank.RoyalFlush, kickers: [14], description: 'Royal Flush', bestCards: sorted };
  }

  // Straight Flush
  if (isFlush && (isStraight || isLowStraight)) {
    const high = isLowStraight && !isStraight ? 5 : values[0];
    return { rank: HandRank.StraightFlush, kickers: [high], description: `Straight Flush, ${rankName(high)} high`, bestCards: sorted };
  }

  // Four of a Kind
  if (groups[0][1] === 4) {
    const quadVal = groups[0][0];
    const kicker = groups[1][0];
    return { rank: HandRank.FourOfAKind, kickers: [quadVal, kicker], description: `Four of a Kind, ${rankName(quadVal)}s`, bestCards: sorted };
  }

  // Full House
  if (groups[0][1] === 3 && groups.length >= 2 && groups[1][1] >= 2) {
    return { rank: HandRank.FullHouse, kickers: [groups[0][0], groups[1][0]], description: `Full House, ${rankName(groups[0][0])}s full of ${rankName(groups[1][0])}s`, bestCards: sorted };
  }

  // Flush
  if (isFlush) {
    return { rank: HandRank.Flush, kickers: values, description: `Flush, ${rankName(values[0])} high`, bestCards: sorted };
  }

  // Straight
  if (isStraight || isLowStraight) {
    const high = isLowStraight && !isStraight ? 5 : values[0];
    return { rank: HandRank.Straight, kickers: [high], description: `Straight, ${rankName(high)} high`, bestCards: sorted };
  }

  // Three of a Kind
  if (groups[0][1] === 3) {
    const tripVal = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]);
    return { rank: HandRank.ThreeOfAKind, kickers: [tripVal, ...kickers], description: `Three of a Kind, ${rankName(tripVal)}s`, bestCards: sorted };
  }

  // Two Pair
  if (groups[0][1] === 2 && groups.length >= 2 && groups[1][1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups.length > 2 ? groups[2][0] : 0;
    return { rank: HandRank.TwoPair, kickers: [highPair, lowPair, kicker], description: `Two Pair, ${rankName(highPair)}s and ${rankName(lowPair)}s`, bestCards: sorted };
  }

  // One Pair
  if (groups[0][1] === 2) {
    const pairVal = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]);
    return { rank: HandRank.OnePair, kickers: [pairVal, ...kickers], description: `Pair of ${rankName(pairVal)}s`, bestCards: sorted };
  }

  // High Card
  return { rank: HandRank.HighCard, kickers: values, description: `${rankName(values[0])} High`, bestCards: sorted };
}

function checkStraight(sortedValues: number[]): boolean {
  if (sortedValues.length < 5) return false;
  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i] - sortedValues[i + 1] !== 1) return false;
  }
  return true;
}

/** Check for A-2-3-4-5 (wheel). */
function checkLowStraight(sortedValues: number[]): boolean {
  if (sortedValues.length < 5) return false;
  const wheel = [14, 5, 4, 3, 2];
  return sortedValues.length === 5 && sortedValues.every((v, i) => v === wheel[i]);
}

function rankName(value: number): string {
  const reverseMap: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
    10: '10', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace',
  };
  return reverseMap[value] ?? String(value);
}

/**
 * Generate all C(n,k) combinations from an array.
 */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const result: T[][] = [];

  function backtrack(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}
