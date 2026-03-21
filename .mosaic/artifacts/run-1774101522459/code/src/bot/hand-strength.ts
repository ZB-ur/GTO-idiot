// ============================================================
// Hand Strength Calculator — Position-aware hand evaluation
// ============================================================

import type { Card, Position, Street } from '../types';
import { RANK_VALUES } from '../types';
import { estimateHandStrength } from '../engine/hand-evaluator';

/**
 * Comprehensive hand strength assessment used by the decision engine.
 */
export interface HandStrengthResult {
  /** Raw hand strength 0–1 (equity vs random hand) */
  raw: number;
  /** Position-adjusted strength (early position penalized) */
  effective: number;
  /** Strength category for decision thresholds */
  category: HandStrengthCategory;
  /** Whether this is a drawing hand (flush/straight draw) */
  hasDraw: boolean;
  /** Number of outs for draws (0 if no draw) */
  drawOuts: number;
}

export type HandStrengthCategory =
  | 'monster'    // Top 5% — sets+, two pair on dry boards
  | 'strong'     // Top 20% — overpair, TPTK
  | 'medium'     // Top 50% — middle pair, weak top pair
  | 'weak'       // Bottom 50% — low pair, ace high
  | 'air';       // No made hand, no draw

/** Position multiplier: later position = stronger effective hand */
const POSITION_MULTIPLIER: Record<Position, number> = {
  UTG: 0.88,
  MP: 0.92,
  CO: 0.96,
  BTN: 1.00,
  SB: 0.90,
  BB: 0.94,
};

/**
 * Calculate comprehensive hand strength for a given game state.
 */
export function calculateHandStrength(
  holeCards: Card[],
  communityCards: Card[],
  position: Position,
  street: Street,
  simulations: number = 300
): HandStrengthResult {
  // Preflop: use preflop hand ranking
  if (street === 'preflop' || communityCards.length === 0) {
    return calculatePreflopStrength(holeCards, position);
  }

  // Postflop: Monte Carlo + draw detection
  const raw = estimateHandStrength(holeCards, communityCards, simulations);
  const posMultiplier = POSITION_MULTIPLIER[position];
  const effective = Math.min(1, raw * posMultiplier);

  const drawInfo = detectDraws(holeCards, communityCards);
  const category = categorizeStrength(effective, drawInfo.hasDraw);

  return {
    raw,
    effective,
    category,
    hasDraw: drawInfo.hasDraw,
    drawOuts: drawInfo.outs,
  };
}

/**
 * Preflop hand strength based on hole card ranking.
 */
function calculatePreflopStrength(
  holeCards: Card[],
  position: Position
): HandStrengthResult {
  const [c1, c2] = holeCards;
  const v1 = RANK_VALUES[c1.rank];
  const v2 = RANK_VALUES[c2.rank];
  const high = Math.max(v1, v2);
  const low = Math.min(v1, v2);
  const suited = c1.suit === c2.suit;
  const pair = v1 === v2;

  let raw: number;

  if (pair) {
    // Pairs: AA=0.95, KK=0.90, ..., 22=0.50
    raw = 0.50 + (high - 2) * 0.0375;
  } else {
    // Base from high card value
    const highScore = (high - 2) / 12; // 0..1
    const lowScore = (low - 2) / 12;
    const gapPenalty = (high - low - 1) * 0.02;
    const suitedBonus = suited ? 0.04 : 0;
    const connectedBonus = (high - low === 1) ? 0.02 : 0;

    raw = Math.min(0.85, Math.max(0.15,
      highScore * 0.5 + lowScore * 0.2 + suitedBonus + connectedBonus - gapPenalty
    ));
  }

  const posMultiplier = POSITION_MULTIPLIER[position];
  const effective = Math.min(1, raw * posMultiplier);
  const category = categorizeStrength(effective, false);

  return {
    raw,
    effective,
    category,
    hasDraw: false,
    drawOuts: 0,
  };
}

/**
 * Detect flush and straight draws in postflop hands.
 */
function detectDraws(
  holeCards: Card[],
  communityCards: Card[]
): { hasDraw: boolean; outs: number } {
  const allCards = [...holeCards, ...communityCards];
  let outs = 0;

  // Flush draw detection
  const suitCounts = new Map<string, number>();
  for (const c of allCards) {
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }
  for (const count of suitCounts.values()) {
    if (count === 4) {
      outs += 9; // 9 flush outs
      break;
    }
  }

  // Straight draw detection (open-ended or gutshot)
  const uniqueValues = [...new Set(allCards.map((c) => RANK_VALUES[c.rank]))].sort((a, b) => a - b);
  const straightOuts = countStraightOuts(uniqueValues);
  outs += straightOuts;

  // Avoid double-counting: cap at reasonable max
  outs = Math.min(outs, 20);

  return {
    hasDraw: outs > 0,
    outs,
  };
}

/**
 * Count straight draw outs (open-ended = 8, gutshot = 4).
 */
function countStraightOuts(sortedValues: number[]): number {
  // Check for 4 consecutive values with a gap
  // Add ace-low value (1) if ace is present
  const values = [...sortedValues];
  if (values.includes(14)) {
    values.unshift(1);
  }

  let maxConsecutive = 1;
  let current = 1;
  let hasGap = false;
  let gapCount = 0;

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff === 1) {
      current++;
      maxConsecutive = Math.max(maxConsecutive, current);
    } else if (diff === 2 && !hasGap) {
      current++;
      hasGap = true;
      gapCount++;
      maxConsecutive = Math.max(maxConsecutive, current);
    } else {
      current = 1;
      hasGap = false;
    }
  }

  // Open-ended straight draw: 4 consecutive cards
  if (maxConsecutive >= 4 && !hasGap) {
    return 8;
  }
  // Gutshot: 4 cards with one gap
  if (maxConsecutive >= 4 && gapCount === 1) {
    return 4;
  }

  return 0;
}

/**
 * Categorize hand strength into decision buckets.
 */
function categorizeStrength(
  effective: number,
  hasDraw: boolean
): HandStrengthCategory {
  if (effective >= 0.85) return 'monster';
  if (effective >= 0.65) return 'strong';
  if (effective >= 0.45) return 'medium';
  if (effective >= 0.25 || hasDraw) return 'weak';
  return 'air';
}

/**
 * Calculate pot odds: amount to call / (pot + amount to call).
 */
export function calculatePotOdds(potBB: number, toCallBB: number): number {
  if (toCallBB <= 0) return 0;
  return toCallBB / (potBB + toCallBB);
}

/**
 * Calculate Stack-to-Pot Ratio (SPR).
 */
export function calculateSPR(effectiveStackBB: number, potBB: number): number {
  if (potBB <= 0) return Infinity;
  return effectiveStackBB / potBB;
}
