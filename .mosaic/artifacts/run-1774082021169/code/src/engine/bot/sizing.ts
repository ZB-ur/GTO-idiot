/**
 * Bet sizing logic with randomization layer.
 * Determines raise/bet amounts based on bot style, street, and pot geometry.
 */

import type { BotStyle } from '../../types/bot';
import type { Street } from '../../types/game';
import { roundTo } from '../utils';

/** Sizing result from the sizing engine */
export interface SizingResult {
  /** The chosen bet/raise amount in BB */
  readonly amount: number;
  /** Sizing label for logging/debugging */
  readonly label: string;
}

/** Sizing profile per street */
interface StreetSizing {
  /** Available bet sizes as fraction of pot */
  readonly sizes: readonly number[];
  /** Weights for each size (higher = more likely) */
  readonly weights: readonly number[];
}

/** Full sizing configuration per style */
const SIZING_CONFIGS: Record<BotStyle, Record<Street, StreetSizing>> = {
  TAG: {
    preflop: { sizes: [2.5, 3, 3.5], weights: [0.3, 0.5, 0.2] },
    flop:    { sizes: [0.33, 0.5, 0.66], weights: [0.25, 0.5, 0.25] },
    turn:    { sizes: [0.5, 0.66, 0.75], weights: [0.3, 0.45, 0.25] },
    river:   { sizes: [0.5, 0.66, 0.75, 1.0], weights: [0.2, 0.35, 0.3, 0.15] },
  },
  LAG: {
    preflop: { sizes: [2.5, 3, 4], weights: [0.2, 0.4, 0.4] },
    flop:    { sizes: [0.5, 0.66, 0.75], weights: [0.2, 0.35, 0.45] },
    turn:    { sizes: [0.66, 0.75, 1.0], weights: [0.25, 0.4, 0.35] },
    river:   { sizes: [0.66, 0.75, 1.0, 1.5], weights: [0.15, 0.3, 0.35, 0.2] },
  },
  NIT: {
    preflop: { sizes: [2.5, 3], weights: [0.6, 0.4] },
    flop:    { sizes: [0.33, 0.5], weights: [0.5, 0.5] },
    turn:    { sizes: [0.5, 0.66], weights: [0.55, 0.45] },
    river:   { sizes: [0.5, 0.66], weights: [0.5, 0.5] },
  },
  Fish: {
    preflop: { sizes: [2, 2.5, 3, 5], weights: [0.3, 0.3, 0.2, 0.2] },
    flop:    { sizes: [0.25, 0.33, 0.5, 1.0], weights: [0.25, 0.25, 0.25, 0.25] },
    turn:    { sizes: [0.25, 0.5, 1.0], weights: [0.3, 0.4, 0.3] },
    river:   { sizes: [0.33, 0.5, 1.0, 2.0], weights: [0.25, 0.25, 0.25, 0.25] },
  },
  Maniac: {
    preflop: { sizes: [3, 4, 5], weights: [0.3, 0.4, 0.3] },
    flop:    { sizes: [0.66, 0.75, 1.0, 1.5], weights: [0.15, 0.25, 0.35, 0.25] },
    turn:    { sizes: [0.75, 1.0, 1.5], weights: [0.2, 0.4, 0.4] },
    river:   { sizes: [1.0, 1.5, 2.0], weights: [0.3, 0.4, 0.3] },
  },
};

/**
 * Select a randomized bet sizing based on bot style and street.
 *
 * @param style - Bot playing style
 * @param street - Current betting street
 * @param pot - Current pot size in BB
 * @param minRaise - Minimum legal raise in BB
 * @param maxRaise - Maximum legal raise (all-in) in BB
 * @param rng - Optional random number (0-1) for deterministic testing
 */
export function selectBetSize(
  style: BotStyle,
  street: Street,
  pot: number,
  minRaise: number,
  maxRaise: number,
  rng?: number,
): SizingResult {
  const config = SIZING_CONFIGS[style][street];
  const roll = rng ?? Math.random();

  // Select size using weighted random
  const selectedFraction = weightedSelect(config.sizes, config.weights, roll);

  let amount: number;
  let label: string;

  if (street === 'preflop') {
    // Preflop: sizes are in BB multiples (open raise size)
    amount = roundTo(selectedFraction, 2);
    label = `${selectedFraction}BB`;
  } else {
    // Postflop: sizes are fractions of pot
    amount = roundTo(pot * selectedFraction, 2);
    label = `${Math.round(selectedFraction * 100)}% pot`;
  }

  // Clamp to legal range
  amount = roundTo(Math.max(minRaise, Math.min(amount, maxRaise)), 2);

  return { amount, label };
}

/**
 * Calculate 3-bet sizing.
 * Standard: 3x the open raise in position, 4x out of position.
 */
export function calc3BetSize(
  style: BotStyle,
  openRaiseAmount: number,
  isInPosition: boolean,
  minRaise: number,
  maxRaise: number,
): SizingResult {
  const multipliers: Record<BotStyle, number> = {
    TAG: 3.0,
    LAG: 3.2,
    NIT: 3.0,
    Fish: 2.5,    // Fish undersizes
    Maniac: 3.5,  // Maniac oversizes
  };

  const baseMultiplier = multipliers[style];
  const positionAdjust = isInPosition ? 1.0 : 1.33;
  const randomAdjust = 0.9 + Math.random() * 0.2; // ±10% randomization

  let amount = roundTo(openRaiseAmount * baseMultiplier * positionAdjust * randomAdjust, 2);
  amount = roundTo(Math.max(minRaise, Math.min(amount, maxRaise)), 2);

  return { amount, label: `3bet ${roundTo(amount / openRaiseAmount, 1)}x` };
}

/**
 * Calculate all-in threshold — the stack-to-pot ratio below which
 * the bot should just shove instead of making a normal raise.
 */
export function shouldShove(
  style: BotStyle,
  stack: number,
  pot: number,
  _street: Street,
): boolean {
  const spr = stack / Math.max(pot, 0.01);

  const shoveThresholds: Record<BotStyle, number> = {
    TAG: 1.5,
    LAG: 2.0,
    NIT: 1.2,
    Fish: 1.0,    // Fish rarely shoves correctly
    Maniac: 3.0,  // Maniac shoves more liberally
  };

  return spr <= shoveThresholds[style];
}

/**
 * Weighted random selection.
 * Given parallel arrays of values and weights, select a value
 * proportional to its weight.
 */
function weightedSelect<T>(values: readonly T[], weights: readonly number[], rng: number): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let cumulative = 0;
  const target = rng * totalWeight;

  for (let i = 0; i < values.length; i++) {
    cumulative += weights[i]!;
    if (target <= cumulative) {
      return values[i]!;
    }
  }

  // Fallback to last value
  return values[values.length - 1]!;
}
