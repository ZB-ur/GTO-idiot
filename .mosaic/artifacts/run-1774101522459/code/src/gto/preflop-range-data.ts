// ============================================================
// Preflop GTO Range Data — Static 6-max range tables
// ============================================================
//
// Simplified GTO preflop ranges for 6-max cash games (100BB deep).
// Frequencies represent raise/call/fold proportions for each hand combo.
// Data is organized by position and scenario.

import type { Position } from '../types';
import type { PreflopRangeAction, PreflopScenario } from '../types';

// --- Hand combo helpers ---

/** All 169 canonical hand combos in order (pairs, suited, offsuit) */
const PAIR_RANKS = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'] as const;

const SUITED_COMBOS = [
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
  'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
  'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
  'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','J2s',
  'T9s','T8s','T7s','T6s','T5s','T4s','T3s','T2s',
  '98s','97s','96s','95s','94s','93s','92s',
  '87s','86s','85s','84s','83s','82s',
  '76s','75s','74s','73s','72s',
  '65s','64s','63s','62s',
  '54s','53s','52s',
  '43s','42s',
  '32s',
] as const;

const OFFSUIT_COMBOS = [
  'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
  'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','K2o',
  'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o','Q3o','Q2o',
  'JTo','J9o','J8o','J7o','J6o','J5o','J4o','J3o','J2o',
  'T9o','T8o','T7o','T6o','T5o','T4o','T3o','T2o',
  '98o','97o','96o','95o','94o','93o','92o',
  '87o','86o','85o','84o','83o','82o',
  '76o','75o','74o','73o','72o',
  '65o','64o','63o','62o',
  '54o','53o','52o',
  '43o','42o',
  '32o',
] as const;

// --- Range frequency type: [raise, call, fold] ---
type Freq = { fold: number; call: number; raise: number };

function r(raise: number, call: number = 0): Freq {
  const fold = Math.max(0, 1 - raise - call);
  return { raise, call, fold: Math.round(fold * 100) / 100 };
}

// ============================================================
// Open (RFI) Ranges by Position
// ============================================================

const UTG_OPEN: Map<string, Freq> = new Map([
  // Pairs
  ['AA', r(1)], ['KK', r(1)], ['QQ', r(1)], ['JJ', r(1)],
  ['TT', r(1)], ['99', r(1)], ['88', r(0.8)], ['77', r(0.6)],
  ['66', r(0.4)], ['55', r(0.3)], ['44', r(0.2)], ['33', r(0.15)], ['22', r(0.1)],
  // Suited
  ['AKs', r(1)], ['AQs', r(1)], ['AJs', r(1)], ['ATs', r(1)],
  ['A9s', r(0.5)], ['A8s', r(0.4)], ['A7s', r(0.3)], ['A6s', r(0.3)],
  ['A5s', r(0.5)], ['A4s', r(0.4)], ['A3s', r(0.3)], ['A2s', r(0.2)],
  ['KQs', r(1)], ['KJs', r(1)], ['KTs', r(0.8)], ['K9s', r(0.3)],
  ['QJs', r(0.9)], ['QTs', r(0.7)], ['Q9s', r(0.2)],
  ['JTs', r(0.8)], ['J9s', r(0.3)],
  ['T9s', r(0.5)], ['T8s', r(0.2)],
  ['98s', r(0.3)], ['87s', r(0.2)], ['76s', r(0.15)],
  // Offsuit
  ['AKo', r(1)], ['AQo', r(1)], ['AJo', r(0.9)], ['ATo', r(0.6)],
  ['KQo', r(0.7)], ['KJo', r(0.4)], ['KTo', r(0.2)],
  ['QJo', r(0.3)], ['JTo', r(0.2)],
]);

const MP_OPEN: Map<string, Freq> = new Map([
  ['AA', r(1)], ['KK', r(1)], ['QQ', r(1)], ['JJ', r(1)],
  ['TT', r(1)], ['99', r(1)], ['88', r(0.9)], ['77', r(0.8)],
  ['66', r(0.6)], ['55', r(0.5)], ['44', r(0.4)], ['33', r(0.3)], ['22', r(0.2)],
  ['AKs', r(1)], ['AQs', r(1)], ['AJs', r(1)], ['ATs', r(1)],
  ['A9s', r(0.7)], ['A8s', r(0.5)], ['A7s', r(0.4)], ['A6s', r(0.4)],
  ['A5s', r(0.6)], ['A4s', r(0.5)], ['A3s', r(0.4)], ['A2s', r(0.3)],
  ['KQs', r(1)], ['KJs', r(1)], ['KTs', r(0.9)], ['K9s', r(0.5)],
  ['QJs', r(1)], ['QTs', r(0.8)], ['Q9s', r(0.4)],
  ['JTs', r(0.9)], ['J9s', r(0.5)],
  ['T9s', r(0.7)], ['T8s', r(0.3)],
  ['98s', r(0.5)], ['87s', r(0.3)], ['76s', r(0.2)], ['65s', r(0.15)],
  ['AKo', r(1)], ['AQo', r(1)], ['AJo', r(1)], ['ATo', r(0.7)],
  ['KQo', r(0.8)], ['KJo', r(0.5)], ['KTo', r(0.3)],
  ['QJo', r(0.4)], ['QTo', r(0.2)], ['JTo', r(0.3)],
]);

const CO_OPEN: Map<string, Freq> = new Map([
  ['AA', r(1)], ['KK', r(1)], ['QQ', r(1)], ['JJ', r(1)],
  ['TT', r(1)], ['99', r(1)], ['88', r(1)], ['77', r(0.9)],
  ['66', r(0.8)], ['55', r(0.7)], ['44', r(0.6)], ['33', r(0.5)], ['22', r(0.4)],
  ['AKs', r(1)], ['AQs', r(1)], ['AJs', r(1)], ['ATs', r(1)],
  ['A9s', r(1)], ['A8s', r(0.8)], ['A7s', r(0.7)], ['A6s', r(0.6)],
  ['A5s', r(0.8)], ['A4s', r(0.7)], ['A3s', r(0.6)], ['A2s', r(0.5)],
  ['KQs', r(1)], ['KJs', r(1)], ['KTs', r(1)], ['K9s', r(0.7)],
  ['K8s', r(0.4)], ['K7s', r(0.3)],
  ['QJs', r(1)], ['QTs', r(1)], ['Q9s', r(0.6)], ['Q8s', r(0.3)],
  ['JTs', r(1)], ['J9s', r(0.7)], ['J8s', r(0.3)],
  ['T9s', r(0.9)], ['T8s', r(0.5)], ['T7s', r(0.2)],
  ['98s', r(0.7)], ['97s', r(0.3)], ['87s', r(0.5)], ['86s', r(0.2)],
  ['76s', r(0.4)], ['75s', r(0.2)], ['65s', r(0.3)], ['54s', r(0.25)],
  ['AKo', r(1)], ['AQo', r(1)], ['AJo', r(1)], ['ATo', r(0.9)],
  ['A9o', r(0.5)], ['A8o', r(0.3)],
  ['KQo', r(1)], ['KJo', r(0.8)], ['KTo', r(0.5)],
  ['QJo', r(0.6)], ['QTo', r(0.4)], ['JTo', r(0.5)],
  ['T9o', r(0.2)], ['98o', r(0.15)],
]);

const BTN_OPEN: Map<string, Freq> = new Map([
  ['AA', r(1)], ['KK', r(1)], ['QQ', r(1)], ['JJ', r(1)],
  ['TT', r(1)], ['99', r(1)], ['88', r(1)], ['77', r(1)],
  ['66', r(1)], ['55', r(0.9)], ['44', r(0.85)], ['33', r(0.8)], ['22', r(0.7)],
  ['AKs', r(1)], ['AQs', r(1)], ['AJs', r(1)], ['ATs', r(1)],
  ['A9s', r(1)], ['A8s', r(1)], ['A7s', r(0.9)], ['A6s', r(0.85)],
  ['A5s', r(1)], ['A4s', r(0.9)], ['A3s', r(0.85)], ['A2s', r(0.8)],
  ['KQs', r(1)], ['KJs', r(1)], ['KTs', r(1)], ['K9s', r(1)],
  ['K8s', r(0.7)], ['K7s', r(0.6)], ['K6s', r(0.5)], ['K5s', r(0.4)],
  ['K4s', r(0.3)], ['K3s', r(0.25)], ['K2s', r(0.2)],
  ['QJs', r(1)], ['QTs', r(1)], ['Q9s', r(0.9)], ['Q8s', r(0.6)],
  ['Q7s', r(0.3)], ['Q6s', r(0.25)],
  ['JTs', r(1)], ['J9s', r(1)], ['J8s', r(0.6)], ['J7s', r(0.3)],
  ['T9s', r(1)], ['T8s', r(0.8)], ['T7s', r(0.4)],
  ['98s', r(1)], ['97s', r(0.6)], ['96s', r(0.3)],
  ['87s', r(0.9)], ['86s', r(0.4)], ['76s', r(0.7)], ['75s', r(0.3)],
  ['65s', r(0.6)], ['64s', r(0.2)], ['54s', r(0.5)], ['53s', r(0.2)],
  ['43s', r(0.2)],
  ['AKo', r(1)], ['AQo', r(1)], ['AJo', r(1)], ['ATo', r(1)],
  ['A9o', r(0.8)], ['A8o', r(0.6)], ['A7o', r(0.4)], ['A6o', r(0.3)],
  ['A5o', r(0.5)], ['A4o', r(0.35)], ['A3o', r(0.3)], ['A2o', r(0.25)],
  ['KQo', r(1)], ['KJo', r(1)], ['KTo', r(0.8)], ['K9o', r(0.4)],
  ['QJo', r(0.9)], ['QTo', r(0.6)], ['Q9o', r(0.3)],
  ['JTo', r(0.7)], ['J9o', r(0.3)],
  ['T9o', r(0.5)], ['T8o', r(0.2)], ['98o', r(0.3)], ['87o', r(0.2)],
]);

const SB_OPEN: Map<string, Freq> = new Map([
  ['AA', r(1)], ['KK', r(1)], ['QQ', r(1)], ['JJ', r(1)],
  ['TT', r(1)], ['99', r(1)], ['88', r(1)], ['77', r(0.9)],
  ['66', r(0.8)], ['55', r(0.7)], ['44', r(0.6)], ['33', r(0.5)], ['22', r(0.4)],
  ['AKs', r(1)], ['AQs', r(1)], ['AJs', r(1)], ['ATs', r(1)],
  ['A9s', r(1)], ['A8s', r(0.8)], ['A7s', r(0.7)], ['A6s', r(0.6)],
  ['A5s', r(0.9)], ['A4s', r(0.7)], ['A3s', r(0.6)], ['A2s', r(0.5)],
  ['KQs', r(1)], ['KJs', r(1)], ['KTs', r(1)], ['K9s', r(0.7)],
  ['K8s', r(0.4)], ['K7s', r(0.3)], ['K6s', r(0.25)],
  ['QJs', r(1)], ['QTs', r(1)], ['Q9s', r(0.6)], ['Q8s', r(0.3)],
  ['JTs', r(1)], ['J9s', r(0.7)], ['J8s', r(0.3)],
  ['T9s', r(0.9)], ['T8s', r(0.5)], ['T7s', r(0.2)],
  ['98s', r(0.7)], ['97s', r(0.3)], ['87s', r(0.5)], ['86s', r(0.2)],
  ['76s', r(0.4)], ['65s', r(0.3)], ['54s', r(0.25)],
  ['AKo', r(1)], ['AQo', r(1)], ['AJo', r(1)], ['ATo', r(0.8)],
  ['A9o', r(0.5)], ['A8o', r(0.3)],
  ['KQo', r(1)], ['KJo', r(0.7)], ['KTo', r(0.4)],
  ['QJo', r(0.5)], ['QTo', r(0.3)], ['JTo', r(0.4)],
  ['T9o', r(0.2)],
]);

// BB doesn't have an open range (already has blind posted)

// ============================================================
// vs_open (Facing Open) Ranges — Simplified
// ============================================================

// BB vs various openers (call or 3-bet)
const BB_VS_OPEN: Map<string, Freq> = new Map([
  ['AA', r(0.8, 0.2)], ['KK', r(0.8, 0.2)], ['QQ', r(0.7, 0.3)], ['JJ', r(0.5, 0.5)],
  ['TT', r(0.3, 0.7)], ['99', r(0.15, 0.7)], ['88', r(0.1, 0.7)], ['77', r(0.05, 0.65)],
  ['66', r(0, 0.6)], ['55', r(0, 0.55)], ['44', r(0, 0.5)], ['33', r(0, 0.4)], ['22', r(0, 0.35)],
  ['AKs', r(0.7, 0.3)], ['AQs', r(0.5, 0.5)], ['AJs', r(0.35, 0.55)], ['ATs', r(0.2, 0.6)],
  ['A9s', r(0.15, 0.55)], ['A8s', r(0.1, 0.5)], ['A7s', r(0.1, 0.45)], ['A6s', r(0.1, 0.4)],
  ['A5s', r(0.2, 0.5)], ['A4s', r(0.15, 0.45)], ['A3s', r(0.1, 0.4)], ['A2s', r(0.1, 0.35)],
  ['KQs', r(0.35, 0.55)], ['KJs', r(0.2, 0.55)], ['KTs', r(0.15, 0.5)], ['K9s', r(0.05, 0.45)],
  ['K8s', r(0, 0.35)], ['K7s', r(0, 0.3)], ['K6s', r(0, 0.25)],
  ['QJs', r(0.15, 0.6)], ['QTs', r(0.1, 0.55)], ['Q9s', r(0, 0.45)],
  ['JTs', r(0.1, 0.6)], ['J9s', r(0, 0.5)],
  ['T9s', r(0.05, 0.55)], ['T8s', r(0, 0.4)],
  ['98s', r(0, 0.5)], ['97s', r(0, 0.35)], ['87s', r(0, 0.45)], ['86s', r(0, 0.3)],
  ['76s', r(0, 0.4)], ['65s', r(0, 0.35)], ['54s', r(0, 0.3)],
  ['AKo', r(0.6, 0.4)], ['AQo', r(0.35, 0.55)], ['AJo', r(0.2, 0.5)], ['ATo', r(0.1, 0.45)],
  ['A9o', r(0, 0.35)], ['A8o', r(0, 0.3)],
  ['KQo', r(0.15, 0.55)], ['KJo', r(0.1, 0.45)], ['KTo', r(0, 0.35)],
  ['QJo', r(0, 0.4)], ['QTo', r(0, 0.3)], ['JTo', r(0, 0.35)],
  ['T9o', r(0, 0.25)], ['98o', r(0, 0.2)],
]);

// Generic IP (CO/BTN) vs open — tighter 3-bet, wider call
const IP_VS_OPEN: Map<string, Freq> = new Map([
  ['AA', r(0.6, 0.4)], ['KK', r(0.6, 0.4)], ['QQ', r(0.5, 0.5)], ['JJ', r(0.4, 0.6)],
  ['TT', r(0.2, 0.7)], ['99', r(0.1, 0.7)], ['88', r(0.05, 0.65)], ['77', r(0, 0.6)],
  ['66', r(0, 0.5)], ['55', r(0, 0.45)], ['44', r(0, 0.35)],
  ['AKs', r(0.6, 0.4)], ['AQs', r(0.4, 0.55)], ['AJs', r(0.25, 0.55)], ['ATs', r(0.15, 0.55)],
  ['A9s', r(0.1, 0.4)], ['A8s', r(0.05, 0.35)], ['A5s', r(0.15, 0.35)], ['A4s', r(0.1, 0.3)],
  ['KQs', r(0.25, 0.6)], ['KJs', r(0.15, 0.55)], ['KTs', r(0.1, 0.5)],
  ['QJs', r(0.1, 0.6)], ['QTs', r(0.05, 0.55)],
  ['JTs', r(0.05, 0.6)], ['J9s', r(0, 0.45)],
  ['T9s', r(0, 0.55)], ['98s', r(0, 0.5)], ['87s', r(0, 0.45)], ['76s', r(0, 0.35)],
  ['65s', r(0, 0.3)], ['54s', r(0, 0.25)],
  ['AKo', r(0.5, 0.45)], ['AQo', r(0.3, 0.5)], ['AJo', r(0.15, 0.4)],
  ['KQo', r(0.1, 0.5)], ['KJo', r(0, 0.35)],
  ['QJo', r(0, 0.3)], ['JTo', r(0, 0.3)],
]);

// ============================================================
// vs_3bet and vs_4bet (simplified)
// ============================================================

const VS_3BET: Map<string, Freq> = new Map([
  ['AA', r(0.6, 0.4)], ['KK', r(0.5, 0.5)], ['QQ', r(0.3, 0.7)], ['JJ', r(0.15, 0.65)],
  ['TT', r(0.05, 0.6)], ['99', r(0, 0.45)], ['88', r(0, 0.35)],
  ['AKs', r(0.5, 0.5)], ['AQs', r(0.2, 0.6)], ['AJs', r(0.1, 0.45)], ['ATs', r(0, 0.35)],
  ['A5s', r(0.1, 0.2)],
  ['KQs', r(0.1, 0.5)], ['KJs', r(0, 0.35)],
  ['QJs', r(0, 0.3)], ['JTs', r(0, 0.3)], ['T9s', r(0, 0.2)],
  ['AKo', r(0.4, 0.5)], ['AQo', r(0.1, 0.4)],
  ['KQo', r(0, 0.25)],
]);

const VS_4BET: Map<string, Freq> = new Map([
  ['AA', r(0.7, 0.3)], ['KK', r(0.6, 0.4)], ['QQ', r(0.2, 0.5)], ['JJ', r(0, 0.35)],
  ['AKs', r(0.4, 0.5)], ['AKo', r(0.3, 0.4)],
  ['AQs', r(0, 0.3)], ['A5s', r(0.15, 0)],
]);

// ============================================================
// Range lookup tables
// ============================================================

const OPEN_RANGES: Record<Position, Map<string, Freq>> = {
  UTG: UTG_OPEN,
  MP: MP_OPEN,
  CO: CO_OPEN,
  BTN: BTN_OPEN,
  SB: SB_OPEN,
  BB: new Map(), // BB doesn't open
};

const DEFAULT_FOLD: Freq = { fold: 1, call: 0, raise: 0 };

/**
 * Look up the preflop range for a given position and scenario.
 */
export function lookupPreflopRange(
  position: Position,
  scenario: PreflopScenario,
  _openerPosition?: Position
): PreflopRangeAction[] {
  let rangeMap: Map<string, Freq>;

  switch (scenario) {
    case 'open':
      rangeMap = OPEN_RANGES[position];
      break;
    case 'vs_open':
      rangeMap = position === 'BB' ? BB_VS_OPEN : IP_VS_OPEN;
      break;
    case 'vs_3bet':
      rangeMap = VS_3BET;
      break;
    case 'vs_4bet':
      rangeMap = VS_4BET;
      break;
    default:
      rangeMap = new Map();
  }

  // Build full 169 combo list with defaults
  const allCombos = [...PAIR_RANKS, ...SUITED_COMBOS, ...OFFSUIT_COMBOS];
  return allCombos.map((combo) => {
    const freq = rangeMap.get(combo) ?? DEFAULT_FOLD;
    return {
      handCombo: combo,
      frequencies: { ...freq },
    };
  });
}

/**
 * Get the action frequencies for a specific hand combo.
 * Returns null if combo not in range (defaults to fold).
 */
export function lookupComboFrequency(
  handCombo: string,
  position: Position,
  scenario: PreflopScenario,
  openerPosition?: Position
): Freq {
  const range = lookupPreflopRange(position, scenario, openerPosition);
  const entry = range.find((a) => a.handCombo === handCombo);
  return entry?.frequencies ?? DEFAULT_FOLD;
}

/**
 * Convert two hole cards to their canonical hand combo string.
 * E.g., As Kh -> "AKs" (if same suit) or "AKo" (if different suit).
 */
export function holeCardsToCombo(cards: [{ rank: string; suit: string }, { rank: string; suit: string }]): string {
  const RANK_ORDER = 'AKQJT98765432';
  const r1 = cards[0].rank === 'T' ? 'T' : cards[0].rank;
  const r2 = cards[1].rank === 'T' ? 'T' : cards[1].rank;
  const i1 = RANK_ORDER.indexOf(r1);
  const i2 = RANK_ORDER.indexOf(r2);

  const high = i1 <= i2 ? r1 : r2;
  const low = i1 <= i2 ? r2 : r1;
  const suited = cards[0].suit === cards[1].suit;

  if (high === low) return `${high}${low}`;
  return `${high}${low}${suited ? 's' : 'o'}`;
}
