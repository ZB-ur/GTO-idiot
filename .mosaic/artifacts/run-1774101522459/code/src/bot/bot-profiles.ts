// ============================================================
// Bot Profiles — TAG, LAG, TP, LP, GTO style configurations
// ============================================================

import type { BotStyle } from '../types';

/**
 * Numeric parameters that control a bot's playing tendencies.
 * All probability values are 0–1.
 */
export interface BotProfile {
  /** Bot style identifier */
  style: BotStyle;
  /** Display name */
  name: string;

  // --- Preflop ---
  /** Fraction of hands to voluntarily put money in preflop (VPIP) */
  vpip: number;
  /** Preflop raise rate (PFR) — of hands played, how often does bot raise */
  pfr: number;
  /** 3-bet frequency when facing a raise */
  threeBetFreq: number;

  // --- Postflop aggression ---
  /** Continuation bet frequency (as PF aggressor) */
  cbetFreq: number;
  /** Double-barrel frequency (bet turn after flop cbet) */
  doubleBarrelFreq: number;
  /** Triple-barrel frequency (bet river after turn barrel) */
  tripleBarrelFreq: number;
  /** Check-raise frequency */
  checkRaiseFreq: number;

  // --- Tendencies ---
  /** How often the bot bluffs (0 = never, 1 = always with air) */
  bluffFreq: number;
  /** How often the bot folds to a bet (base rate, modified by hand strength) */
  foldToBetBase: number;
  /** Aggression factor: (bet + raise) / call ratio weight */
  aggressionFactor: number;

  // --- Sizing ---
  /** Default bet size as fraction of pot */
  defaultBetSizePot: number;
  /** Raise size multiplier relative to current bet */
  raiseSizeMultiplier: number;

  // --- Randomness ---
  /** Variance factor: how much randomness to add to decisions (0 = deterministic) */
  variance: number;
}

/**
 * Pre-defined bot profiles for each play style.
 */
export const BOT_PROFILES: Record<BotStyle, BotProfile> = {
  TAG: {
    style: 'TAG',
    name: 'Tight-Aggressive',
    vpip: 0.22,
    pfr: 0.18,
    threeBetFreq: 0.08,
    cbetFreq: 0.72,
    doubleBarrelFreq: 0.55,
    tripleBarrelFreq: 0.40,
    checkRaiseFreq: 0.08,
    bluffFreq: 0.20,
    foldToBetBase: 0.40,
    aggressionFactor: 3.0,
    defaultBetSizePot: 0.66,
    raiseSizeMultiplier: 2.5,
    variance: 0.10,
  },

  LAG: {
    style: 'LAG',
    name: 'Loose-Aggressive',
    vpip: 0.35,
    pfr: 0.28,
    threeBetFreq: 0.12,
    cbetFreq: 0.78,
    doubleBarrelFreq: 0.60,
    tripleBarrelFreq: 0.45,
    checkRaiseFreq: 0.12,
    bluffFreq: 0.35,
    foldToBetBase: 0.30,
    aggressionFactor: 3.8,
    defaultBetSizePot: 0.75,
    raiseSizeMultiplier: 2.8,
    variance: 0.15,
  },

  TP: {
    style: 'TP',
    name: 'Tight-Passive',
    vpip: 0.18,
    pfr: 0.08,
    threeBetFreq: 0.04,
    cbetFreq: 0.40,
    doubleBarrelFreq: 0.25,
    tripleBarrelFreq: 0.15,
    checkRaiseFreq: 0.03,
    bluffFreq: 0.08,
    foldToBetBase: 0.55,
    aggressionFactor: 1.2,
    defaultBetSizePot: 0.50,
    raiseSizeMultiplier: 2.2,
    variance: 0.08,
  },

  LP: {
    style: 'LP',
    name: 'Loose-Passive',
    vpip: 0.42,
    pfr: 0.10,
    threeBetFreq: 0.03,
    cbetFreq: 0.35,
    doubleBarrelFreq: 0.20,
    tripleBarrelFreq: 0.10,
    checkRaiseFreq: 0.02,
    bluffFreq: 0.05,
    foldToBetBase: 0.35,
    aggressionFactor: 0.8,
    defaultBetSizePot: 0.45,
    raiseSizeMultiplier: 2.0,
    variance: 0.12,
  },

  GTO: {
    style: 'GTO',
    name: 'Game Theory Optimal',
    vpip: 0.27,
    pfr: 0.22,
    threeBetFreq: 0.09,
    cbetFreq: 0.65,
    doubleBarrelFreq: 0.50,
    tripleBarrelFreq: 0.35,
    checkRaiseFreq: 0.07,
    bluffFreq: 0.25,
    foldToBetBase: 0.38,
    aggressionFactor: 2.5,
    defaultBetSizePot: 0.66,
    raiseSizeMultiplier: 2.5,
    variance: 0.05,
  },
};

/**
 * Get the profile for a given bot style.
 */
export function getBotProfile(style: BotStyle): BotProfile {
  return BOT_PROFILES[style];
}

/**
 * Generate a bot name incorporating style and seat number.
 */
export function generateBotName(style: BotStyle, seat: number): string {
  return `BOT-${style}-${seat}`;
}
