// ============================================================
// GTO Idiot — Metrics Calculator
// Pure-function calculator for key poker statistics:
// VPIP, PFR, 3-Bet%, WTSD%, W$SD%, AF, C-Bet, Fold-to-CBet
// ============================================================

import type { KeyMetrics } from '../types';

// ============================================================
// Input type — one entry per hand
// ============================================================

export interface MetricsInput {
  /** Did the hero voluntarily put money in the pot preflop? */
  vpip: boolean;
  /** Did the hero raise preflop (PFR)? */
  pfr: boolean;
  /** Did the hero 3-bet preflop? */
  three_bet: boolean;
  /** Did the hand go to showdown with hero still in? */
  went_to_showdown: boolean;
  /** Did the hero win at showdown? */
  won_at_showdown: boolean;
  /** Total number of bets and raises by hero across all streets */
  bets_and_raises: number;
  /** Total number of calls by hero across all streets */
  calls: number;
  /** Did the hero c-bet the flop (was PF raiser and bet the flop)? */
  cbet_flop: boolean;
  /** Did the hero face a c-bet on the flop? */
  faced_flop_cbet: boolean;
  /** Did the hero fold to a flop c-bet? */
  folded_to_flop_cbet: boolean;
}

// ============================================================
// Calculator
// ============================================================

/**
 * Calculate all key poker metrics from a set of hand inputs.
 * All percentage values are returned as 0-100 numbers.
 */
export function calculateKeyMetrics(inputs: MetricsInput[]): KeyMetrics {
  const total = inputs.length;

  if (total === 0) {
    return {
      vpip: 0,
      pfr: 0,
      three_bet: 0,
      wtsd: 0,
      won_at_showdown: 0,
      aggression_factor: 0,
      cbet_flop: 0,
      fold_to_cbet: 0,
    };
  }

  // VPIP: Voluntarily Put $ In Pot
  const vpipCount = inputs.filter((h) => h.vpip).length;
  const vpip = pct(vpipCount, total);

  // PFR: Pre-Flop Raise
  const pfrCount = inputs.filter((h) => h.pfr).length;
  const pfr = pct(pfrCount, total);

  // 3-Bet%
  const threeBetCount = inputs.filter((h) => h.three_bet).length;
  const threeBet = pct(threeBetCount, total);

  // WTSD%: Went To ShowDown (of hands that saw the flop)
  const sawFlop = inputs.filter((h) => h.vpip).length; // approximation
  const wtsdCount = inputs.filter((h) => h.went_to_showdown).length;
  const wtsd = sawFlop > 0 ? pct(wtsdCount, sawFlop) : 0;

  // W$SD: Won $ at ShowDown
  const showdownHands = inputs.filter((h) => h.went_to_showdown);
  const wonAtShowdownCount = showdownHands.filter((h) => h.won_at_showdown).length;
  const wonAtShowdown = showdownHands.length > 0
    ? pct(wonAtShowdownCount, showdownHands.length)
    : 0;

  // Aggression Factor: (Bets + Raises) / Calls
  const totalBetsRaises = inputs.reduce((s, h) => s + h.bets_and_raises, 0);
  const totalCalls = inputs.reduce((s, h) => s + h.calls, 0);
  const aggressionFactor = totalCalls > 0
    ? round2(totalBetsRaises / totalCalls)
    : totalBetsRaises > 0 ? 999 : 0; // infinity → cap at 999

  // C-Bet Flop%
  const cbetOpportunities = inputs.filter((h) => h.pfr).length;
  const cbetCount = inputs.filter((h) => h.cbet_flop).length;
  const cbetFlop = cbetOpportunities > 0 ? pct(cbetCount, cbetOpportunities) : 0;

  // Fold to C-Bet%
  const facedCbetCount = inputs.filter((h) => h.faced_flop_cbet).length;
  const foldedToCbetCount = inputs.filter((h) => h.folded_to_flop_cbet).length;
  const foldToCbet = facedCbetCount > 0 ? pct(foldedToCbetCount, facedCbetCount) : 0;

  return {
    vpip: round2(vpip),
    pfr: round2(pfr),
    three_bet: round2(threeBet),
    wtsd: round2(wtsd),
    won_at_showdown: round2(wonAtShowdown),
    aggression_factor: Math.min(aggressionFactor, 999),
    cbet_flop: round2(cbetFlop),
    fold_to_cbet: round2(foldToCbet),
  };
}

// ============================================================
// Helpers
// ============================================================

function pct(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
