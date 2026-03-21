// ============================================================
// HandEvaluator — Evaluate 5/6/7 card poker hands
// ============================================================

import type { Card, Rank } from '../types';
import { RANK_VALUES } from '../types';

/** Hand ranking categories, higher = better */
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

export const HAND_RANK_NAMES: Record<HandRankCategory, string> = {
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

export interface EvaluatedHand {
  /** Numeric score for comparison — higher wins */
  score: number;
  /** Category of the hand */
  category: HandRankCategory;
  /** Human-readable description, e.g. "Full House, Kings over Tens" */
  description: string;
  /** The best 5 cards forming the hand */
  bestCards: Card[];
}

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
 * Evaluate the best 5-card poker hand from 5, 6, or 7 cards.
 * Uses brute-force combination enumeration (max C(7,5) = 21 combos).
 */
export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(`evaluateHand requires 5-7 cards, got ${cards.length}`);
  }

  if (cards.length === 5) {
    return evaluate5(cards);
  }

  // Enumerate all C(n,5) combinations and pick the best
  const combos = combinations(cards, 5);
  let best: EvaluatedHand | null = null;

  for (const combo of combos) {
    const result = evaluate5(combo);
    if (!best || result.score > best.score) {
      best = result;
    }
  }

  return best!;
}

/**
 * Compare two evaluated hands. Returns:
 *  > 0 if hand a wins
 *  < 0 if hand b wins
 *  = 0 if tie
 */
export function compareHands(a: EvaluatedHand, b: EvaluatedHand): number {
  return a.score - b.score;
}

/**
 * Compute hand strength as a float 0..1 among random opponent hands.
 * Uses simplified Monte Carlo sampling.
 */
export function estimateHandStrength(
  holeCards: Card[],
  communityCards: Card[],
  simulations: number = 500
): number {
  const knownCards = new Set(
    [...holeCards, ...communityCards].map((c) => `${c.rank}${c.suit}`)
  );

  // Build remaining deck
  const remaining: Card[] = [];
  const suits: Card['suit'][] = ['s', 'h', 'd', 'c'];
  const ranks: Card['rank'][] = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
  for (const s of suits) {
    for (const r of ranks) {
      if (!knownCards.has(`${r}${s}`)) {
        remaining.push({ rank: r, suit: s });
      }
    }
  }

  const communityNeeded = 5 - communityCards.length;
  let wins = 0;
  let ties = 0;

  for (let i = 0; i < simulations; i++) {
    // Shuffle remaining
    const shuffled = shuffleArray(remaining);
    let idx = 0;

    // Complete community
    const fullCommunity = [...communityCards];
    for (let j = 0; j < communityNeeded; j++) {
      fullCommunity.push(shuffled[idx++]);
    }

    // Opponent hole cards
    const oppHole = [shuffled[idx++], shuffled[idx++]];

    const myHand = evaluateHand([...holeCards, ...fullCommunity]);
    const oppHand = evaluateHand([...oppHole, ...fullCommunity]);

    const cmp = compareHands(myHand, oppHand);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
  }

  return (wins + ties * 0.5) / simulations;
}

// ============================================================
// Internal helpers
// ============================================================

function evaluate5(cards: Card[]): EvaluatedHand {
  const sorted = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
  const values = sorted.map((c) => RANK_VALUES[c.rank]);
  const ranks = sorted.map((c) => c.rank);

  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);
  const isStraight = checkStraight(values);
  const isWheelStraight = checkWheel(values);

  // Count rank frequencies
  const freqMap = new Map<number, number>();
  for (const v of values) {
    freqMap.set(v, (freqMap.get(v) || 0) + 1);
  }
  const freqs = Array.from(freqMap.entries()).sort((a, b) => {
    // Sort by frequency desc, then by rank value desc
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  const freqCounts = freqs.map(([, f]) => f);

  // --- Determine category ---

  if (isFlush && isStraight) {
    if (values[0] === 14 && values[1] === 13) {
      return makeResult(HandRankCategory.RoyalFlush, sorted, scoreFlat(9, values), 'Royal Flush');
    }
    return makeResult(
      HandRankCategory.StraightFlush,
      sorted,
      scoreFlat(8, values),
      `Straight Flush, ${RANK_NAME_SINGULAR[ranks[0]]} high`
    );
  }

  if (isFlush && isWheelStraight) {
    // A-2-3-4-5 flush (wheel straight flush)
    const wheelCards = reorderWheel(sorted);
    return makeResult(
      HandRankCategory.StraightFlush,
      wheelCards,
      scoreFlat(8, [5, 4, 3, 2, 1]),
      'Straight Flush, Five high'
    );
  }

  if (freqCounts[0] === 4) {
    const quadRank = freqs[0][0];
    const kicker = freqs[1][0];
    return makeResult(
      HandRankCategory.FourOfAKind,
      sorted,
      scoreFlat(7, [quadRank, quadRank, quadRank, quadRank, kicker]),
      `Four of a Kind, ${RANK_NAMES[valueToRank(quadRank)]}`
    );
  }

  if (freqCounts[0] === 3 && freqCounts[1] === 2) {
    const tripRank = freqs[0][0];
    const pairRank = freqs[1][0];
    return makeResult(
      HandRankCategory.FullHouse,
      sorted,
      scoreFlat(6, [tripRank, tripRank, tripRank, pairRank, pairRank]),
      `Full House, ${RANK_NAMES[valueToRank(tripRank)]} over ${RANK_NAMES[valueToRank(pairRank)]}`
    );
  }

  if (isFlush) {
    return makeResult(
      HandRankCategory.Flush,
      sorted,
      scoreFlat(5, values),
      `Flush, ${RANK_NAME_SINGULAR[ranks[0]]} high`
    );
  }

  if (isStraight) {
    return makeResult(
      HandRankCategory.Straight,
      sorted,
      scoreFlat(4, values),
      `Straight, ${RANK_NAME_SINGULAR[ranks[0]]} high`
    );
  }

  if (isWheelStraight) {
    const wheelCards = reorderWheel(sorted);
    return makeResult(
      HandRankCategory.Straight,
      wheelCards,
      scoreFlat(4, [5, 4, 3, 2, 1]),
      'Straight, Five high'
    );
  }

  if (freqCounts[0] === 3) {
    const tripRank = freqs[0][0];
    const kickers = freqs.slice(1).map(([v]) => v);
    return makeResult(
      HandRankCategory.ThreeOfAKind,
      sorted,
      scoreFlat(3, [tripRank, tripRank, tripRank, ...kickers]),
      `Three of a Kind, ${RANK_NAMES[valueToRank(tripRank)]}`
    );
  }

  if (freqCounts[0] === 2 && freqCounts[1] === 2) {
    const highPair = Math.max(freqs[0][0], freqs[1][0]);
    const lowPair = Math.min(freqs[0][0], freqs[1][0]);
    const kicker = freqs[2][0];
    return makeResult(
      HandRankCategory.TwoPair,
      sorted,
      scoreFlat(2, [highPair, highPair, lowPair, lowPair, kicker]),
      `Two Pair, ${RANK_NAMES[valueToRank(highPair)]} and ${RANK_NAMES[valueToRank(lowPair)]}`
    );
  }

  if (freqCounts[0] === 2) {
    const pairRank = freqs[0][0];
    const kickers = freqs.slice(1).map(([v]) => v);
    return makeResult(
      HandRankCategory.OnePair,
      sorted,
      scoreFlat(1, [pairRank, pairRank, ...kickers]),
      `Pair of ${RANK_NAMES[valueToRank(pairRank)]}`
    );
  }

  return makeResult(
    HandRankCategory.HighCard,
    sorted,
    scoreFlat(0, values),
    `${RANK_NAME_SINGULAR[ranks[0]]} high`
  );
}

function checkStraight(sortedValues: number[]): boolean {
  for (let i = 0; i < 4; i++) {
    if (sortedValues[i] - sortedValues[i + 1] !== 1) return false;
  }
  return true;
}

/** Check for A-2-3-4-5 (wheel) straight */
function checkWheel(sortedValues: number[]): boolean {
  // Values sorted desc: [14, 5, 4, 3, 2]
  return (
    sortedValues[0] === 14 &&
    sortedValues[1] === 5 &&
    sortedValues[2] === 4 &&
    sortedValues[3] === 3 &&
    sortedValues[4] === 2
  );
}

function reorderWheel(sorted: Card[]): Card[] {
  // Move Ace to the end for wheel straights
  const ace = sorted.find((c) => c.rank === 'A')!;
  return [...sorted.filter((c) => c.rank !== 'A'), ace];
}

/**
 * Create a numeric score: category * 15^5 + value[0]*15^4 + value[1]*15^3 + ...
 * This ensures higher category always wins, with tiebreakers by kicker.
 */
function scoreFlat(category: number, values: number[]): number {
  let score = category;
  for (const v of values) {
    score = score * 15 + v;
  }
  return score;
}

function makeResult(
  category: HandRankCategory,
  bestCards: Card[],
  score: number,
  description: string
): EvaluatedHand {
  return { score, category, description, bestCards: bestCards.slice(0, 5) };
}

const VALUE_TO_RANK: Record<number, Rank> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8',
  9: '9', 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

function valueToRank(value: number): Rank {
  return VALUE_TO_RANK[value];
}

/** Generate all C(n, k) combinations */
function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const combo: T[] = [];

  function recurse(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      recurse(i + 1);
      combo.pop();
    }
  }

  recurse(0);
  return result;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
