/**
 * BOT opponent profiles — 5 parameterized playing styles.
 * Each profile defines VPIP, PFR, aggression, and bluff frequency
 * that drive preflop range selection and postflop decision trees.
 */

import type { BotProfile, BotStyle } from '../../types/bot';

/** Internal bot parameters used by the decision engine */
export interface BotStyleParams {
  /** Voluntarily put money in pot % (0-100) */
  readonly vpip: number;
  /** Preflop raise % (0-100) */
  readonly pfr: number;
  /** Aggression factor (0-1): higher = more bets/raises vs calls */
  readonly aggression: number;
  /** Bluff frequency (0-1): probability of bluffing with weak hands */
  readonly bluffFrequency: number;
  /** Continuation bet frequency (0-1) */
  readonly cbetFrequency: number;
  /** Check-raise frequency (0-1) */
  readonly checkRaiseFrequency: number;
  /** Fold to 3-bet frequency (0-1) */
  readonly foldTo3Bet: number;
  /** Slowplay frequency (0-1): probability of checking strong hands */
  readonly slowplayFrequency: number;
}

/** Complete bot profile definitions */
const BOT_PROFILES: readonly BotProfile[] = [
  {
    id: 'bot-tag-1',
    name: 'Alex "The Rock"',
    style: 'TAG',
    description: 'Tight-Aggressive: plays few hands but plays them hard. Solid fundamental strategy.',
    avatar: '🪨',
    parameters: { vpip: 22, pfr: 18, aggression: 0.7, bluffFrequency: 0.15 },
  },
  {
    id: 'bot-lag-1',
    name: 'Sam "The Storm"',
    style: 'LAG',
    description: 'Loose-Aggressive: wide range, constant pressure. Hard to read and always betting.',
    avatar: '⚡',
    parameters: { vpip: 35, pfr: 28, aggression: 0.8, bluffFrequency: 0.35 },
  },
  {
    id: 'bot-nit-1',
    name: 'Pat "The Wall"',
    style: 'NIT',
    description: 'Ultra-tight Passive: only plays premium hands. When they bet, watch out.',
    avatar: '🧱',
    parameters: { vpip: 12, pfr: 9, aggression: 0.4, bluffFrequency: 0.05 },
  },
  {
    id: 'bot-fish-1',
    name: 'Casey "Lucky"',
    style: 'Fish',
    description: 'Loose-weak Passive: calls too much, rarely raises. Easy to value bet against.',
    avatar: '🐟',
    parameters: { vpip: 50, pfr: 8, aggression: 0.2, bluffFrequency: 0.08 },
  },
  {
    id: 'bot-maniac-1',
    name: 'Max "All-In"',
    style: 'Maniac',
    description: 'Ultra-loose Ultra-aggressive: raises almost everything. Pure chaos at the table.',
    avatar: '🔥',
    parameters: { vpip: 60, pfr: 45, aggression: 0.9, bluffFrequency: 0.5 },
  },
] as const;

/** Extended style parameters for the decision engine */
const STYLE_PARAMS: Record<BotStyle, BotStyleParams> = {
  TAG: {
    vpip: 22,
    pfr: 18,
    aggression: 0.7,
    bluffFrequency: 0.15,
    cbetFrequency: 0.65,
    checkRaiseFrequency: 0.08,
    foldTo3Bet: 0.55,
    slowplayFrequency: 0.1,
  },
  LAG: {
    vpip: 35,
    pfr: 28,
    aggression: 0.8,
    bluffFrequency: 0.35,
    cbetFrequency: 0.75,
    checkRaiseFrequency: 0.12,
    foldTo3Bet: 0.4,
    slowplayFrequency: 0.15,
  },
  NIT: {
    vpip: 12,
    pfr: 9,
    aggression: 0.4,
    bluffFrequency: 0.05,
    cbetFrequency: 0.5,
    checkRaiseFrequency: 0.03,
    foldTo3Bet: 0.7,
    slowplayFrequency: 0.05,
  },
  Fish: {
    vpip: 50,
    pfr: 8,
    aggression: 0.2,
    bluffFrequency: 0.08,
    cbetFrequency: 0.3,
    checkRaiseFrequency: 0.02,
    foldTo3Bet: 0.3,
    slowplayFrequency: 0.02,
  },
  Maniac: {
    vpip: 60,
    pfr: 45,
    aggression: 0.9,
    bluffFrequency: 0.5,
    cbetFrequency: 0.85,
    checkRaiseFrequency: 0.18,
    foldTo3Bet: 0.2,
    slowplayFrequency: 0.2,
  },
};

/** Get all bot profiles */
export function getAllBotProfiles(): readonly BotProfile[] {
  return BOT_PROFILES;
}

/** Get a bot profile by ID */
export function getBotProfileById(id: string): BotProfile | undefined {
  return BOT_PROFILES.find(p => p.id === id);
}

/** Get bot profiles for a given style */
export function getBotProfilesByStyle(style: BotStyle): readonly BotProfile[] {
  return BOT_PROFILES.filter(p => p.style === style);
}

/** Get the extended style parameters for a bot style */
export function getStyleParams(style: BotStyle): BotStyleParams {
  return STYLE_PARAMS[style];
}

/** Get a default set of 5 bots (one per style) for a 6-max table */
export function getDefaultBotLineup(): readonly BotProfile[] {
  return BOT_PROFILES;
}
