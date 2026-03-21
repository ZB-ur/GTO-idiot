// ============================================================
// GTO Idiot — Preflop Range Tables
// Static GTO-approximate preflop ranges for 6-max NL Hold'em.
// 169 starting hand combinations × position × scenario.
// ============================================================

import type { Position, PreflopScenario, HandRangeEntry, PreflopRangeTable } from '../types';

// ---------- Starting hand ordering (169 combos) ----------

/** All 169 canonical starting hands in standard order */
export const STARTING_HANDS: string[] = (() => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hands: string[] = [];
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i; j < ranks.length; j++) {
      if (i === j) {
        hands.push(`${ranks[i]}${ranks[j]}`); // pocket pair
      } else {
        hands.push(`${ranks[i]}${ranks[j]}s`); // suited
        hands.push(`${ranks[i]}${ranks[j]}o`); // offsuit
      }
    }
  }
  return hands;
})();

// ---------- Hand classification ----------

/**
 * Classify two hole cards into a canonical starting hand string.
 * e.g., Ah Kh → "AKs", As Kd → "AKo", Jh Jd → "JJ"
 */
export function classifyHoleCards(
  rank1: string,
  suit1: string,
  rank2: string,
  suit2: string,
): string {
  const order = 'AKQJT98765432';
  const idx1 = order.indexOf(rank1);
  const idx2 = order.indexOf(rank2);

  let high: string, low: string;
  let highSuit: string, lowSuit: string;

  if (idx1 <= idx2) {
    high = rank1; low = rank2;
    highSuit = suit1; lowSuit = suit2;
  } else {
    high = rank2; low = rank1;
    highSuit = suit2; lowSuit = suit1;
  }

  if (high === low) return `${high}${low}`; // pair
  const suited = highSuit === lowSuit;
  return `${high}${low}${suited ? 's' : 'o'}`;
}

// ---------- Tier system for range generation ----------

/**
 * Hands are classified into tiers based on strength.
 * Each position/scenario maps tiers to action frequencies.
 */
enum Tier {
  Premium = 0,   // AA, KK, QQ, AKs
  Strong = 1,    // JJ, TT, AKo, AQs, AQo, AJs
  Good = 2,      // 99, 88, ATs, AJo, KQs, KQo, ATo, KJs
  Playable = 3,  // 77, 66, A9s-A2s, KTs, QJs, QTs, JTs, KJo, QJo
  Marginal = 4,  // 55, 44, 33, 22, K9s-K2s, Q9s, J9s, T9s, 98s, 87s, 76s, misc offsuit
  Speculative = 5, // Remaining suited connectors, suited gappers
  Trash = 6,     // Everything else
}

const HAND_TIERS: Record<string, Tier> = {};

// Premium
for (const h of ['AA', 'KK', 'QQ', 'AKs']) HAND_TIERS[h] = Tier.Premium;

// Strong
for (const h of ['JJ', 'TT', 'AKo', 'AQs', 'AQo', 'AJs']) HAND_TIERS[h] = Tier.Strong;

// Good
for (const h of ['99', '88', 'ATs', 'AJo', 'KQs', 'KQo', 'ATo', 'KJs']) HAND_TIERS[h] = Tier.Good;

// Playable
for (const h of [
  '77', '66', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'KTs', 'QJs', 'QTs', 'JTs', 'KJo', 'QJo', 'A9o',
]) HAND_TIERS[h] = Tier.Playable;

// Marginal
for (const h of [
  '55', '44', '33', '22', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
  'Q9s', 'Q8s', 'J9s', 'T9s', '98s', '87s', '76s', '65s',
  'KTo', 'QTo', 'JTo', 'A8o', 'A7o',
]) HAND_TIERS[h] = Tier.Marginal;

// Speculative
for (const h of [
  'J8s', 'T8s', '97s', '86s', '75s', '64s', '54s', '53s', '43s',
  'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
  'J7s', 'T7s', '96s', '85s', '74s', '63s', '52s', '42s',
]) HAND_TIERS[h] = Tier.Speculative;

/** Get tier of a starting hand (default: Trash) */
function getTier(hand: string): Tier {
  return HAND_TIERS[hand] ?? Tier.Trash;
}

// ---------- Position × Scenario → Tier thresholds ----------

interface TierFrequencies {
  fold: number;
  call: number;
  raise: number;
}

type RangeProfile = Record<Tier, TierFrequencies>;

/**
 * For each position × scenario, define action frequencies per tier.
 * These are GTO-approximate values based on standard 6-max strategy.
 */
function getOpenProfile(position: Position): RangeProfile {
  switch (position) {
    case 'UTG':
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Good]:        { fold: 0.05, call: 0,    raise: 0.95 },
        [Tier.Playable]:    { fold: 0.4,  call: 0,    raise: 0.6 },
        [Tier.Marginal]:    { fold: 0.85, call: 0,    raise: 0.15 },
        [Tier.Speculative]: { fold: 1.0,  call: 0,    raise: 0 },
        [Tier.Trash]:       { fold: 1.0,  call: 0,    raise: 0 },
      };
    case 'HJ':
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Good]:        { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Playable]:    { fold: 0.2,  call: 0,    raise: 0.8 },
        [Tier.Marginal]:    { fold: 0.6,  call: 0,    raise: 0.4 },
        [Tier.Speculative]: { fold: 0.9,  call: 0,    raise: 0.1 },
        [Tier.Trash]:       { fold: 1.0,  call: 0,    raise: 0 },
      };
    case 'CO':
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Good]:        { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Playable]:    { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Marginal]:    { fold: 0.3,  call: 0,    raise: 0.7 },
        [Tier.Speculative]: { fold: 0.6,  call: 0,    raise: 0.4 },
        [Tier.Trash]:       { fold: 0.95, call: 0,    raise: 0.05 },
      };
    case 'BTN':
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Good]:        { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Playable]:    { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Marginal]:    { fold: 0.1,  call: 0,    raise: 0.9 },
        [Tier.Speculative]: { fold: 0.3,  call: 0,    raise: 0.7 },
        [Tier.Trash]:       { fold: 0.7,  call: 0,    raise: 0.3 },
      };
    case 'SB':
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Good]:        { fold: 0,    call: 0.1,  raise: 0.9 },
        [Tier.Playable]:    { fold: 0.1,  call: 0.2,  raise: 0.7 },
        [Tier.Marginal]:    { fold: 0.3,  call: 0.2,  raise: 0.5 },
        [Tier.Speculative]: { fold: 0.5,  call: 0.2,  raise: 0.3 },
        [Tier.Trash]:       { fold: 0.75, call: 0.15, raise: 0.1 },
      };
    case 'BB':
      // BB can't "open" — this is used for vs_open (defending)
      return {
        [Tier.Premium]:     { fold: 0,    call: 0,    raise: 1.0 },
        [Tier.Strong]:      { fold: 0,    call: 0.3,  raise: 0.7 },
        [Tier.Good]:        { fold: 0,    call: 0.5,  raise: 0.5 },
        [Tier.Playable]:    { fold: 0.1,  call: 0.6,  raise: 0.3 },
        [Tier.Marginal]:    { fold: 0.3,  call: 0.55, raise: 0.15 },
        [Tier.Speculative]: { fold: 0.5,  call: 0.4,  raise: 0.1 },
        [Tier.Trash]:       { fold: 0.7,  call: 0.25, raise: 0.05 },
      };
  }
}

function getVsOpenProfile(position: Position, _openPosition?: Position): RangeProfile {
  // Simplified: tighter ranges when facing an open
  const tightness = position === 'BB' ? 0 : position === 'SB' ? 0.1 : 0.2;
  return {
    [Tier.Premium]:     { fold: 0,               call: 0.1,            raise: 0.9 },
    [Tier.Strong]:      { fold: 0,               call: 0.4,            raise: 0.6 },
    [Tier.Good]:        { fold: 0.1 + tightness, call: 0.5,            raise: 0.4 - tightness },
    [Tier.Playable]:    { fold: 0.3 + tightness, call: 0.5 - tightness * 0.5, raise: 0.2 },
    [Tier.Marginal]:    { fold: 0.6 + tightness, call: 0.3 - tightness, raise: 0.1 },
    [Tier.Speculative]: { fold: 0.8 + tightness, call: 0.15 - tightness * 0.5, raise: 0.05 },
    [Tier.Trash]:       { fold: 1.0,             call: 0,              raise: 0 },
  };
}

function getVs3BetProfile(_position: Position): RangeProfile {
  return {
    [Tier.Premium]:     { fold: 0,   call: 0.2, raise: 0.8 },
    [Tier.Strong]:      { fold: 0.1, call: 0.5, raise: 0.4 },
    [Tier.Good]:        { fold: 0.4, call: 0.5, raise: 0.1 },
    [Tier.Playable]:    { fold: 0.7, call: 0.3, raise: 0 },
    [Tier.Marginal]:    { fold: 0.9, call: 0.1, raise: 0 },
    [Tier.Speculative]: { fold: 1.0, call: 0,   raise: 0 },
    [Tier.Trash]:       { fold: 1.0, call: 0,   raise: 0 },
  };
}

function getVs4BetProfile(_position: Position): RangeProfile {
  return {
    [Tier.Premium]:     { fold: 0,   call: 0.3, raise: 0.7 },
    [Tier.Strong]:      { fold: 0.3, call: 0.5, raise: 0.2 },
    [Tier.Good]:        { fold: 0.7, call: 0.3, raise: 0 },
    [Tier.Playable]:    { fold: 0.95, call: 0.05, raise: 0 },
    [Tier.Marginal]:    { fold: 1.0, call: 0,   raise: 0 },
    [Tier.Speculative]: { fold: 1.0, call: 0,   raise: 0 },
    [Tier.Trash]:       { fold: 1.0, call: 0,   raise: 0 },
  };
}

// ---------- Public API ----------

/**
 * Build a full 169-hand range table for the given position and scenario.
 */
export function getPreflopRangeTable(
  position: Position,
  scenario: PreflopScenario,
  openPosition?: Position | null,
): PreflopRangeTable {
  let profile: RangeProfile;

  switch (scenario) {
    case 'open':
      profile = getOpenProfile(position);
      break;
    case 'vs_open':
      profile = getVsOpenProfile(position, openPosition ?? undefined);
      break;
    case 'vs_3bet':
      profile = getVs3BetProfile(position);
      break;
    case 'vs_4bet':
      profile = getVs4BetProfile(position);
      break;
  }

  const ranges: HandRangeEntry[] = STARTING_HANDS.map((hand) => {
    const tier = getTier(hand);
    const freq = profile[tier];
    return {
      hand,
      actions: {
        fold: round3(freq.fold),
        call: round3(freq.call),
        raise: round3(freq.raise),
      },
    };
  });

  return {
    position,
    scenario,
    open_position: openPosition ?? null,
    ranges,
  };
}

/**
 * Look up the GTO frequencies for a specific starting hand.
 */
export function getHandFrequencies(
  hand: string,
  position: Position,
  scenario: PreflopScenario,
  openPosition?: Position,
): { fold: number; call: number; raise: number } {
  let profile: RangeProfile;

  switch (scenario) {
    case 'open':
      profile = getOpenProfile(position);
      break;
    case 'vs_open':
      profile = getVsOpenProfile(position, openPosition);
      break;
    case 'vs_3bet':
      profile = getVs3BetProfile(position);
      break;
    case 'vs_4bet':
      profile = getVs4BetProfile(position);
      break;
  }

  const tier = getTier(hand);
  const freq = profile[tier];
  return {
    fold: round3(freq.fold),
    call: round3(freq.call),
    raise: round3(freq.raise),
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
