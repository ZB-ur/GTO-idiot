/**
 * Preflop range tables for BOT opponents.
 * Defines which hands each bot style will play from each position.
 *
 * Hand notation: "AKs" = suited, "AKo" = offsuit, "AA" = pair
 * Ranges are ordered by strength; the bot plays the top N% based on VPIP/PFR.
 */

import type { BotStyle } from '../../types/bot';
import type { Position } from '../../types/game';
import type { HoleCards, Rank } from '../../types/card';

/** Action the bot should take preflop */
export type PreflopAction = 'raise' | 'call' | 'fold';

/** A preflop range entry with raise/call frequencies */
export interface PreflopRangeEntry {
  readonly hand: string;
  /** Probability of raising with this hand (0-1) */
  readonly raiseFreq: number;
  /** Probability of calling with this hand (0-1) */
  readonly callFreq: number;
  /** Remaining probability is fold */
}

/**
 * Canonical hand strength ordering (169 unique combos).
 * Top = strongest. Used to build position-based ranges.
 */
const HAND_TIERS: readonly string[] = [
  // Tier 1: Premium (top ~3%)
  'AA', 'KK', 'QQ', 'AKs',
  // Tier 2: Strong (top ~6%)
  'JJ', 'AKo', 'AQs', 'TT',
  // Tier 3: Good (top ~12%)
  'AQo', 'AJs', '99', 'KQs', 'ATs', '88', 'KJs', 'AJo',
  // Tier 4: Playable (top ~20%)
  'KTs', 'QJs', 'ATo', 'KQo', '77', 'QTs', 'A9s', 'JTs', 'KJo',
  'A8s', '66', 'K9s', 'QJo', 'A7s', 'A5s',
  // Tier 5: Speculative (top ~30%)
  'T9s', 'A6s', '55', 'A4s', 'KTo', 'J9s', 'QTo', 'A3s', 'A2s',
  'K8s', 'Q9s', 'JTo', 'T8s', '98s', '44',
  // Tier 6: Marginal (top ~45%)
  'K7s', 'J8s', 'Q8s', 'K6s', 'T7s', '87s', '97s', '33', 'K5s',
  'K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', '76s', '86s', 'J7s', '22',
  '65s', '96s', 'A9o', '54s', 'T6s', '75s',
  // Tier 7: Weak (top ~65%)
  'Q5s', 'Q4s', 'Q3s', 'Q2s', '64s', 'J6s', 'J5s', 'J4s', 'J3s',
  'J2s', '85s', '53s', 'T5s', 'T4s', 'T3s', 'T2s', '43s', '74s',
  '95s', '84s', '63s', '94s', '93s', '92s', 'K9o', 'J9o', 'T9o',
  // Tier 8: Trash (bottom)
  '52s', '42s', '32s', '73s', '62s', '83s', '82s', '72s', 'A8o',
  'K8o', 'Q9o', 'J8o', 'T8o', '98o', '87o', '76o', '65o', '54o',
  'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'K7o', 'K6o', 'K5o',
  'K4o', 'K3o', 'K2o', 'Q8o', 'Q7o', 'Q6o', 'Q5o', 'Q4o', 'Q3o',
  'Q2o', 'J7o', 'J6o', 'J5o', 'J4o', 'J3o', 'J2o', 'T7o', 'T6o',
  'T5o', 'T4o', 'T3o', 'T2o', '97o', '96o', '95o', '94o', '93o',
  '92o', '86o', '85o', '84o', '83o', '82o', '75o', '74o', '73o',
  '72o', '64o', '63o', '62o', '53o', '52o', '43o', '42o', '32o',
];

/**
 * Position multiplier: later positions play wider ranges.
 * These multiply the base VPIP to get effective range width.
 */
const POSITION_WIDTH: Record<Position, number> = {
  UTG: 0.55,
  MP: 0.7,
  CO: 0.9,
  BTN: 1.2,
  SB: 0.8,
  BB: 1.0, // BB defends wider due to already having money in
};

/**
 * Convert hole cards to canonical hand notation.
 * e.g. Ah Ks -> "AKs", Ah Kd -> "AKo", Ah Ad -> "AA"
 */
export function holeCardsToNotation(holeCards: HoleCards): string {
  const r1 = holeCards.card1.rank;
  const r2 = holeCards.card2.rank;
  const suited = holeCards.card1.suit === holeCards.card2.suit;

  const ranks = sortRanks(r1, r2);

  if (ranks[0] === ranks[1]) {
    return `${ranks[0]}${ranks[1]}`;
  }
  return `${ranks[0]}${ranks[1]}${suited ? 's' : 'o'}`;
}

/** Sort two ranks by value (higher first) */
function sortRanks(r1: Rank, r2: Rank): [Rank, Rank] {
  const RANK_ORDER: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return RANK_ORDER[r1] >= RANK_ORDER[r2] ? [r1, r2] : [r2, r1];
}

/** Get the hand tier index (0 = strongest). Returns -1 if not found. */
function getHandTierIndex(notation: string): number {
  return HAND_TIERS.indexOf(notation);
}

/**
 * Determine the preflop action for a bot given its style, position, and cards.
 *
 * @param style - Bot playing style
 * @param position - Bot's table position
 * @param holeCards - Bot's hole cards
 * @param facingRaise - Whether the bot is facing an existing raise
 * @param raiseCount - Number of raises already made (0 = unopened, 1 = facing open, 2 = facing 3bet)
 */
export function getPreflopAction(
  style: BotStyle,
  position: Position,
  holeCards: HoleCards,
  facingRaise: boolean,
  raiseCount: number,
): PreflopAction {
  const notation = holeCardsToNotation(holeCards);
  const tierIndex = getHandTierIndex(notation);

  // Unknown hand (not in our table) — fold
  if (tierIndex === -1) return 'fold';

  const percentile = (tierIndex / HAND_TIERS.length) * 100;
  const posMultiplier = POSITION_WIDTH[position];

  // Get style-specific thresholds
  const thresholds = getStyleThresholds(style);

  // Adjust for position
  const raiseThreshold = thresholds.raiseWidth * posMultiplier;
  const callThreshold = thresholds.callWidth * posMultiplier;

  // Adjust for facing action
  if (raiseCount >= 3) {
    // Facing 4bet+ — only premiums
    return percentile <= thresholds.fourBetCallWidth ? 'call' :
           percentile <= thresholds.fourBetRaiseWidth ? 'raise' : 'fold';
  }

  if (raiseCount >= 2) {
    // Facing 3bet — tighten significantly
    const threeBetDefend = raiseThreshold * 0.45;
    if (percentile <= threeBetDefend * 0.6) return 'raise'; // 4bet
    if (percentile <= threeBetDefend) return 'call';
    return 'fold';
  }

  if (facingRaise) {
    // Facing open raise — tighten up
    const defendWidth = callThreshold * 0.7;
    const threeWidth = raiseThreshold * 0.35;
    if (percentile <= threeWidth) return 'raise'; // 3bet
    if (percentile <= defendWidth) return 'call';
    return 'fold';
  }

  // Unopened pot
  if (percentile <= raiseThreshold) return 'raise';
  if (percentile <= callThreshold) return 'call'; // limp (mainly Fish)
  return 'fold';
}

/** Style-specific range width thresholds (as percentile of all hands) */
interface StyleThresholds {
  raiseWidth: number;   // % of hands to open-raise
  callWidth: number;    // % of hands to limp/call with
  fourBetRaiseWidth: number; // % to 4bet
  fourBetCallWidth: number;  // % to call 4bet
}

function getStyleThresholds(style: BotStyle): StyleThresholds {
  switch (style) {
    case 'TAG':
      return { raiseWidth: 18, callWidth: 22, fourBetRaiseWidth: 3, fourBetCallWidth: 6 };
    case 'LAG':
      return { raiseWidth: 28, callWidth: 35, fourBetRaiseWidth: 5, fourBetCallWidth: 10 };
    case 'NIT':
      return { raiseWidth: 9, callWidth: 12, fourBetRaiseWidth: 2, fourBetCallWidth: 3 };
    case 'Fish':
      return { raiseWidth: 8, callWidth: 50, fourBetRaiseWidth: 1, fourBetCallWidth: 5 };
    case 'Maniac':
      return { raiseWidth: 45, callWidth: 60, fourBetRaiseWidth: 8, fourBetCallWidth: 15 };
  }
}

/**
 * Check if a hand is in the bot's preflop range for a given position.
 * Used for display/analysis purposes.
 */
export function isInRange(
  style: BotStyle,
  position: Position,
  holeCards: HoleCards,
): boolean {
  const action = getPreflopAction(style, position, holeCards, false, 0);
  return action !== 'fold';
}

/**
 * Get the full preflop range for a style + position as a list of hand notations.
 * Useful for debugging and GTO comparison.
 */
export function getPreflopRange(style: BotStyle, position: Position): readonly string[] {
  const thresholds = getStyleThresholds(style);
  const posMultiplier = POSITION_WIDTH[position];
  const effectiveWidth = thresholds.callWidth * posMultiplier;

  const rangeSize = Math.ceil((effectiveWidth / 100) * HAND_TIERS.length);
  return HAND_TIERS.slice(0, rangeSize);
}
