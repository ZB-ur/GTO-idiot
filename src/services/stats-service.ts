// ============================================================
// GTO Idiot — Stats Service
// Computes overall statistics, profit curves, and position stats.
// ============================================================

import type {
  StatsSummary,
  ProfitCurveResponse,
  ProfitDataPoint,
  PositionStatsResponse,
  PositionStat,
  Position,
} from '../types';
import {
  getAllHandRecords,
} from '../storage/hand-repository';
import { listSessions } from '../storage/session-repository';
import type { HandRecord } from '../storage/database';
import { calculateKeyMetrics, type MetricsInput } from './metrics-calculator';

// ============================================================
// Filter Options
// ============================================================

export interface StatsFilterOptions {
  hand_range?: '100' | '500' | 'all';
  start_date?: string;
  end_date?: string;
}

// ============================================================
// Stats Summary
// ============================================================

/**
 * Get an overview of all-time statistics.
 */
export async function getStatsSummary(
  options: StatsFilterOptions = {},
): Promise<StatsSummary> {
  const hands = await getFilteredHands(options);
  const { total: sessionsCount } = await listSessions();

  const totalHands = hands.length;

  if (totalHands === 0) {
    return {
      total_hands: 0,
      win_rate: 0,
      net_profit_bb: 0,
      bb_per_100: 0,
      sessions_count: sessionsCount,
      avg_hands_per_session: 0,
    };
  }

  const wins = hands.filter((h) => h.result_bb > 0).length;
  const winRate = round2((wins / totalHands) * 100);
  const netProfitBb = round2(hands.reduce((sum, h) => sum + h.result_bb, 0));
  const bbPer100 = totalHands >= 10
    ? round2((netProfitBb / totalHands) * 100)
    : 0;
  const avgHandsPerSession = sessionsCount > 0
    ? round2(totalHands / sessionsCount)
    : 0;

  return {
    total_hands: totalHands,
    win_rate: winRate,
    net_profit_bb: netProfitBb,
    bb_per_100: bbPer100,
    sessions_count: sessionsCount,
    avg_hands_per_session: avgHandsPerSession,
  };
}

// ============================================================
// Profit Curve
// ============================================================

/**
 * Generate cumulative profit curve data points.
 */
export async function getProfitCurve(
  options: StatsFilterOptions & { group_by?: 'hand' | 'session' } = {},
): Promise<ProfitCurveResponse> {
  const { group_by = 'hand' } = options;
  const hands = await getFilteredHands(options);

  if (hands.length === 0) {
    return { data_points: [] };
  }

  // Sort by date ascending
  hands.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (group_by === 'hand') {
    return buildHandProfitCurve(hands);
  }

  return buildSessionProfitCurve(hands);
}

function buildHandProfitCurve(hands: HandRecord[]): ProfitCurveResponse {
  const dataPoints: ProfitDataPoint[] = [];
  let cumulative = 0;

  for (let i = 0; i < hands.length; i++) {
    cumulative += hands[i].result_bb;
    dataPoints.push({
      x: i + 1,
      y: round2(cumulative),
      hand_id: hands[i].id,
      session_id: hands[i].session_id,
    });
  }

  return { data_points: dataPoints };
}

function buildSessionProfitCurve(hands: HandRecord[]): ProfitCurveResponse {
  // Group by session, summing profit per session
  const sessionMap = new Map<string, { total: number; lastHandId: string }>();

  for (const hand of hands) {
    const entry = sessionMap.get(hand.session_id) ?? { total: 0, lastHandId: hand.id };
    entry.total += hand.result_bb;
    entry.lastHandId = hand.id;
    sessionMap.set(hand.session_id, entry);
  }

  const dataPoints: ProfitDataPoint[] = [];
  let cumulative = 0;
  let sessionIndex = 0;

  for (const [sessionId, entry] of sessionMap) {
    sessionIndex++;
    cumulative += entry.total;
    dataPoints.push({
      x: sessionIndex,
      y: round2(cumulative),
      hand_id: entry.lastHandId,
      session_id: sessionId,
    });
  }

  return { data_points: dataPoints };
}

// ============================================================
// Position Stats
// ============================================================

/**
 * Get statistics broken down by table position.
 */
export async function getPositionStats(
  options: StatsFilterOptions = {},
): Promise<PositionStatsResponse> {
  const hands = await getFilteredHands(options);
  const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

  const positionStats: PositionStat[] = positions.map((pos) => {
    const posHands = hands.filter((h) => h.position === pos);
    const count = posHands.length;

    if (count === 0) {
      return { position: pos, hands: 0, net_profit_bb: 0 };
    }

    const netProfitBb = round2(posHands.reduce((sum, h) => sum + h.result_bb, 0));
    const bbPer100 = count >= 10 ? round2((netProfitBb / count) * 100) : undefined;

    // Calculate position-specific VPIP and PFR
    const metricsInput = handsToMetricsInput(posHands);
    const metrics = calculateKeyMetrics(metricsInput);

    return {
      position: pos,
      hands: count,
      net_profit_bb: netProfitBb,
      bb_per_100: bbPer100,
      vpip: round2(metrics.vpip),
      pfr: round2(metrics.pfr),
    };
  });

  return { positions: positionStats };
}

// ============================================================
// Shared Helpers
// ============================================================

async function getFilteredHands(options: StatsFilterOptions): Promise<HandRecord[]> {
  let hands = await getAllHandRecords();

  // Apply date filters
  if (options.start_date) {
    const start = new Date(options.start_date).getTime();
    hands = hands.filter((h) => new Date(h.date).getTime() >= start);
  }
  if (options.end_date) {
    const end = new Date(options.end_date).getTime();
    hands = hands.filter((h) => new Date(h.date).getTime() <= end);
  }

  // Apply hand range limit
  if (options.hand_range && options.hand_range !== 'all') {
    const limit = parseInt(options.hand_range, 10);
    // Sort by date descending to get most recent N hands
    hands.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    hands = hands.slice(0, limit);
  }

  return hands;
}

/**
 * Convert HandRecords to the input format needed by the metrics calculator.
 */
function handsToMetricsInput(hands: HandRecord[]): MetricsInput[] {
  return hands.map((h) => {
    const heroActions = h.actions.filter((a) => a.is_hero);
    const preflopActions = heroActions.filter((a) => a.street === 'preflop');
    const flopActions = heroActions.filter((a) => a.street === 'flop');

    // Determine basic flags from action history
    const vpip = preflopActions.some(
      (a) => a.action === 'call' || a.action === 'raise' || a.action === 'all_in',
    );
    const pfr = preflopActions.some(
      (a) => a.action === 'raise' || a.action === 'all_in',
    );
    const threeBet = preflopActions.filter(
      (a) => a.action === 'raise',
    ).length >= 2;

    // WTSD: did the hand go to showdown with hero still active?
    const wentToShowdown = h.result.went_to_showdown &&
      heroActions.length > 0 &&
      !heroActions.some((a) => a.action === 'fold');

    const wonAtShowdown = wentToShowdown && h.result_bb > 0;

    // Aggression: count bets/raises vs calls
    const betsAndRaises = heroActions.filter(
      (a) => a.action === 'raise' || a.action === 'all_in',
    ).length;
    const calls = heroActions.filter((a) => a.action === 'call').length;

    // C-bet: did hero raise preflop and bet the flop?
    const wasPreRaiser = pfr;
    const cbetFlop = wasPreRaiser && flopActions.some(
      (a) => a.action === 'raise' || a.action === 'all_in',
    );

    // Fold to c-bet: did hero face a flop bet (after not being the preflop raiser)
    // and fold?
    const facedFlopBet = !wasPreRaiser && h.actions.some(
      (a) => a.street === 'flop' && !a.is_hero && (a.action === 'raise' || a.action === 'all_in'),
    );
    const foldedToFlopBet = facedFlopBet && flopActions.some((a) => a.action === 'fold');

    return {
      vpip,
      pfr,
      three_bet: threeBet,
      went_to_showdown: wentToShowdown,
      won_at_showdown: wonAtShowdown,
      bets_and_raises: betsAndRaises,
      calls,
      cbet_flop: cbetFlop,
      faced_flop_cbet: facedFlopBet,
      folded_to_flop_cbet: foldedToFlopBet,
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export { handsToMetricsInput };
