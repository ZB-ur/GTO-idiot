/**
 * Texas Hold'em hand evaluator.
 * Evaluates the best 5-card hand from 7 cards (2 hole + 5 community).
 * Returns a numeric rank for comparison and a human-readable description.
 */

import type { Card, Rank } from '../types/card';
import { rankValue, compareCards } from './utils';

/** Hand ranking categories (higher = better) */
export enum HandRankCategory {
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

/** Evaluated hand result */
export interface HandEvaluation {
  /** Numeric rank — higher is better. Compare directly for winner determination. */
  readonly rank: number;
  /** Category of the hand */
  readonly category: HandRankCategory;
  /** Human-readable description, e.g. "Two Pair, Aces and Kings" */
  readonly description: string;
  /** The best 5 cards making up the hand */
  readonly bestCards: readonly Card[];
}

const CATEGORY_NAMES: Record<HandRankCategory, string> = {
  [HandRankCategory.HighCard]: 'High Card',
  [HandRankCategory.OnePair]: 'One Pair',
  [HandRankCategory.TwoPair]: 'Two Pair',
  [HandRankCategory.ThreeOfAKind]: 'Three of a Kind',
  [HandRankCategory.Straight]: 'Straight',
  [HandRankCategory.Flush]: 'Flush',
  [HandRankCategory.FullHouse]: 'Full House',
  [HandRankCategory.FourOfAKind]: 'Four of a Kind',
  [HandRankCategory.StraightFlush]: 'Straight Flush',
  [HandRankCategory.RoyalFlush]: 'Royal Flush',
};

const RANK_NAMES: Record<Rank, string> = {
  '2': 'Twos', '3': 'Threes', '4': 'Fours', '5': 'Fives',
  '6': 'Sixes', '7': 'Sevens', '8': 'Eights', '9': 'Nines',
  'T': 'Tens', 'J': 'Jacks', 'Q': 'Queens', 'K': 'Kings', 'A': 'Aces',
};

const RANK_NAME_SINGULAR: Record<Rank, string> = {
  '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
  '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
  'T': 'Ten', 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
};

/**
 * Evaluate the best 5-card hand from up to 7 cards.
 * Works with 5, 6, or 7 cards.
 */
export function evaluateHand(cards: readonly Card[]): HandEvaluation {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(`Expected 5-7 cards, got ${cards.length}`);
  }

  // Generate all 5-card combinations
  const combos = combinations(cards, 5);
  let best: HandEvaluation | null = null;

  for (const combo of combos) {
    const evaluation = evaluate5Cards(combo);
    if (!best || evaluation.rank > best.rank) {
      best = evaluation;
    }
  }

  return best!;
}

/** Evaluate exactly 5 cards */
function evaluate5Cards(cards: readonly Card[]): HandEvaluation {
  const sorted = [...cards].sort(compareCards); // descending by rank
  const isFlush = checkFlush(sorted);
  const straightHighCard = checkStraight(sorted);
  const groups = groupByRank(sorted);

  // Straight Flush / Royal Flush
  if (isFlush && straightHighCard !== null) {
    const category = straightHighCard === 14
      ? HandRankCategory.RoyalFlush
      : HandRankCategory.StraightFlush;
    const rank = encodeRank(category, [straightHighCard]);
    const description = category === HandRankCategory.RoyalFlush
      ? 'Royal Flush'
      : `Straight Flush, ${RANK_NAME_SINGULAR[sorted[0]!.rank]} high`;
    return { rank, category, description, bestCards: sorted };
  }

  // Four of a Kind
  if (groups[0]!.count === 4) {
    const quadRank = rankValue(groups[0]!.rank);
    const kicker = rankValue(groups[1]!.rank);
    const rank = encodeRank(HandRankCategory.FourOfAKind, [quadRank, kicker]);
    return {
      rank,
      category: HandRankCategory.FourOfAKind,
      description: `Four of a Kind, ${RANK_NAMES[groups[0]!.rank]}`,
      bestCards: sorted,
    };
  }

  // Full House
  if (groups[0]!.count === 3 && groups[1]!.count === 2) {
    const tripRank = rankValue(groups[0]!.rank);
    const pairRank = rankValue(groups[1]!.rank);
    const rank = encodeRank(HandRankCategory.FullHouse, [tripRank, pairRank]);
    return {
      rank,
      category: HandRankCategory.FullHouse,
      description: `Full House, ${RANK_NAMES[groups[0]!.rank]} full of ${RANK_NAMES[groups[1]!.rank]}`,
      bestCards: sorted,
    };
  }

  // Flush
  if (isFlush) {
    const values = sorted.map(c => rankValue(c.rank));
    const rank = encodeRank(HandRankCategory.Flush, values);
    return {
      rank,
      category: HandRankCategory.Flush,
      description: `Flush, ${RANK_NAME_SINGULAR[sorted[0]!.rank]} high`,
      bestCards: sorted,
    };
  }

  // Straight
  if (straightHighCard !== null) {
    const rank = encodeRank(HandRankCategory.Straight, [straightHighCard]);
    const highRankName = straightHighCard === 5 ? 'Five' :
      RANK_NAME_SINGULAR[sorted[0]!.rank];
    return {
      rank,
      category: HandRankCategory.Straight,
      description: `Straight, ${highRankName} high`,
      bestCards: sorted,
    };
  }

  // Three of a Kind
  if (groups[0]!.count === 3) {
    const tripRank = rankValue(groups[0]!.rank);
    const kickers = groups.slice(1).map(g => rankValue(g.rank));
    const rank = encodeRank(HandRankCategory.ThreeOfAKind, [tripRank, ...kickers]);
    return {
      rank,
      category: HandRankCategory.ThreeOfAKind,
      description: `Three of a Kind, ${RANK_NAMES[groups[0]!.rank]}`,
      bestCards: sorted,
    };
  }

  // Two Pair
  if (groups[0]!.count === 2 && groups[1]!.count === 2) {
    const highPair = rankValue(groups[0]!.rank);
    const lowPair = rankValue(groups[1]!.rank);
    const kicker = rankValue(groups[2]!.rank);
    const rank = encodeRank(HandRankCategory.TwoPair, [highPair, lowPair, kicker]);
    return {
      rank,
      category: HandRankCategory.TwoPair,
      description: `Two Pair, ${RANK_NAMES[groups[0]!.rank]} and ${RANK_NAMES[groups[1]!.rank]}`,
      bestCards: sorted,
    };
  }

  // One Pair
  if (groups[0]!.count === 2) {
    const pairRank = rankValue(groups[0]!.rank);
    const kickers = groups.slice(1).map(g => rankValue(g.rank));
    const rank = encodeRank(HandRankCategory.OnePair, [pairRank, ...kickers]);
    return {
      rank,
      category: HandRankCategory.OnePair,
      description: `Pair of ${RANK_NAMES[groups[0]!.rank]}`,
      bestCards: sorted,
    };
  }

  // High Card
  const values = sorted.map(c => rankValue(c.rank));
  const rank = encodeRank(HandRankCategory.HighCard, values);
  return {
    rank,
    category: HandRankCategory.HighCard,
    description: `${RANK_NAME_SINGULAR[sorted[0]!.rank]} High`,
    bestCards: sorted,
  };
}

/**
 * Encode hand rank as a single comparable number.
 * Format: category * 15^5 + v0 * 15^4 + v1 * 15^3 + ...
 * This ensures higher categories always beat lower ones,
 * and within same category, kickers break ties.
 */
function encodeRank(category: HandRankCategory, values: number[]): number {
  let rank = category * Math.pow(15, 5);
  for (let i = 0; i < values.length && i < 5; i++) {
    rank += (values[i] ?? 0) * Math.pow(15, 4 - i);
  }
  return rank;
}

/** Check if all 5 cards are the same suit */
function checkFlush(cards: readonly Card[]): boolean {
  return cards.every(c => c.suit === cards[0]!.suit);
}

/**
 * Check for a straight. Returns the high card value if straight found, null otherwise.
 * Handles ace-low straight (A-2-3-4-5) returning 5.
 */
function checkStraight(sortedDesc: readonly Card[]): number | null {
  const values = [...new Set(sortedDesc.map(c => rankValue(c.rank)))].sort((a, b) => b - a);

  if (values.length < 5) return null;

  // Check regular straight
  if (values[0]! - values[4]! === 4 && values.length === 5) {
    return values[0]!;
  }

  // Check ace-low: A-2-3-4-5
  if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    return 5; // 5-high straight (wheel)
  }

  return null;
}

interface RankGroup {
  rank: Rank;
  count: number;
  cards: Card[];
}

/**
 * Group cards by rank, sorted by count desc then rank value desc.
 * This naturally puts quads > trips > pairs > singles, with higher ranks first within.
 */
function groupByRank(cards: readonly Card[]): RankGroup[] {
  const map = new Map<Rank, Card[]>();
  for (const card of cards) {
    const arr = map.get(card.rank) ?? [];
    arr.push(card);
    map.set(card.rank, arr);
  }

  const groups: RankGroup[] = [];
  for (const [rank, groupCards] of map) {
    groups.push({ rank, count: groupCards.length, cards: groupCards });
  }

  groups.sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return rankValue(b.rank) - rankValue(a.rank);
  });

  return groups;
}

/** Generate all C(n, k) combinations from an array */
function combinations<T>(arr: readonly T[], k: number): T[][] {
  const result: T[][] = [];

  function backtrack(start: number, current: T[]): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]!);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

/**
 * Compare two evaluated hands. Returns:
 * - positive if hand1 wins
 * - negative if hand2 wins
 * - 0 if tie
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  return hand1.rank - hand2.rank;
}

/**
 * Determine the winner(s) from a list of player hands.
 * Returns the indices of winners (multiple in case of a split pot).
 */
export function determineWinners(
  hands: readonly { playerId: string; evaluation: HandEvaluation }[]
): string[] {
  if (hands.length === 0) return [];

  let bestRank = -1;
  let winners: string[] = [];

  for (const hand of hands) {
    if (hand.evaluation.rank > bestRank) {
      bestRank = hand.evaluation.rank;
      winners = [hand.playerId];
    } else if (hand.evaluation.rank === bestRank) {
      winners.push(hand.playerId);
    }
  }

  return winners;
}

/** Get a human-readable hand category name */
export function getCategoryName(category: HandRankCategory): string {
  return CATEGORY_NAMES[category];
}
