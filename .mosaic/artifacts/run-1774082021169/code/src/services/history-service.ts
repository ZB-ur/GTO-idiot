/**
 * History service — paginated hand history queries and aggregate statistics.
 */

import type {
  HandHistoryList,
  HandHistorySummary,
  Position,
} from '../types/game';
import { db, type StoredHandRecord } from './db';

/** Query filters for hand history */
export interface HandHistoryQuery {
  readonly offset?: number;
  readonly limit?: number;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly position?: Position;
  readonly result?: 'win' | 'loss' | 'all';
  readonly sortBy?: 'date' | 'profit';
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * List hand history with pagination and filters.
 */
export async function listHands(query: HandHistoryQuery = {}): Promise<HandHistoryList> {
  const {
    offset = 0,
    limit = 20,
    dateFrom,
    dateTo,
    position,
    result = 'all',
    sortBy = 'date',
    sortOrder = 'desc',
  } = query;

  // Get all hands from DB, then filter in memory
  // (Dexie compound queries are limited; for <10k records this is fine)
  let hands = await db.hands.toArray();

  // Apply date filters
  if (dateFrom) {
    hands = hands.filter(h => h.playedAt >= dateFrom);
  }
  if (dateTo) {
    hands = hands.filter(h => h.playedAt <= dateTo);
  }

  // Apply position filter
  if (position) {
    hands = hands.filter(h => {
      const userPlayer = h.players.find(p => p.isUser);
      return userPlayer?.position === position;
    });
  }

  // Apply result filter
  if (result !== 'all') {
    hands = hands.filter(h => {
      const profit = h.result.userProfit ?? 0;
      return result === 'win' ? profit > 0 : profit < 0;
    });
  }

  // Sort
  hands.sort((a, b) => {
    let cmp: number;
    if (sortBy === 'profit') {
      cmp = (a.result.userProfit ?? 0) - (b.result.userProfit ?? 0);
    } else {
      cmp = a.playedAt.localeCompare(b.playedAt);
    }
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const total = hands.length;

  // Paginate
  const page = hands.slice(offset, offset + limit);

  // Convert to summaries
  const summaries: HandHistorySummary[] = page.map(h => toSummary(h));

  return { hands: summaries, total, offset, limit };
}

/**
 * Get aggregate session statistics.
 */
export interface SessionStats {
  readonly totalHands: number;
  readonly winRate: number;
  readonly vpip: number;
  readonly pfr: number;
  readonly threeBetPercent: number;
  readonly avgProfitPerHand: number;
  readonly totalProfit: number;
  readonly handsWon: number;
  readonly handsLost: number;
  readonly biggestWin: number;
  readonly biggestLoss: number;
  readonly showdownWinRate: number;
}

/**
 * Compute aggregate stats from stored hand records.
 */
export async function getStats(dateFrom?: string, dateTo?: string): Promise<SessionStats> {
  let hands = await db.hands.toArray();

  if (dateFrom) hands = hands.filter(h => h.playedAt >= dateFrom);
  if (dateTo) hands = hands.filter(h => h.playedAt <= dateTo);

  const totalHands = hands.length;
  if (totalHands === 0) {
    return {
      totalHands: 0,
      winRate: 0,
      vpip: 0,
      pfr: 0,
      threeBetPercent: 0,
      avgProfitPerHand: 0,
      totalProfit: 0,
      handsWon: 0,
      handsLost: 0,
      biggestWin: 0,
      biggestLoss: 0,
      showdownWinRate: 0,
    };
  }

  let totalProfit = 0;
  let handsWon = 0;
  let handsLost = 0;
  let biggestWin = 0;
  let biggestLoss = 0;
  let vpipCount = 0;
  let pfrCount = 0;
  let threeBetCount = 0;
  let showdownCount = 0;
  let showdownWins = 0;

  for (const hand of hands) {
    const profit = hand.result.userProfit ?? 0;
    totalProfit += profit;

    if (profit > 0) handsWon++;
    else if (profit < 0) handsLost++;

    biggestWin = Math.max(biggestWin, profit);
    biggestLoss = Math.min(biggestLoss, profit);

    // VPIP: did user voluntarily put money in?
    const userPlayer = hand.players.find(p => p.isUser);
    if (userPlayer) {
      const preflopActions = hand.actionsByStreet.preflop ?? [];
      const userPreflopActions = preflopActions.filter(
        a => a.playerId === userPlayer.playerId &&
          (a.action === 'call' || a.action === 'raise' || a.action === 'all_in'),
      );
      if (userPreflopActions.length > 0) vpipCount++;

      // PFR: did user raise preflop?
      const userRaises = preflopActions.filter(
        a => a.playerId === userPlayer.playerId &&
          (a.action === 'raise' || a.action === 'all_in'),
      );
      if (userRaises.length > 0) pfrCount++;

      // 3-bet: did user re-raise preflop?
      const raisesBeforeUser = preflopActions.filter(
        a => a.playerId !== userPlayer.playerId &&
          (a.action === 'raise' || a.action === 'all_in'),
      );
      if (raisesBeforeUser.length > 0 && userRaises.length > 0) {
        threeBetCount++;
      }
    }

    // Showdown stats
    if (hand.result.wentToShowdown) {
      showdownCount++;
      if (profit > 0) showdownWins++;
    }
  }

  totalProfit = Math.round(totalProfit * 100) / 100;
  const winRate = Math.round((totalProfit / totalHands) * 100 * 100) / 100; // BB/100
  const avgProfitPerHand = Math.round((totalProfit / totalHands) * 100) / 100;
  const vpip = Math.round((vpipCount / totalHands) * 100 * 10) / 10;
  const pfr = Math.round((pfrCount / totalHands) * 100 * 10) / 10;
  const threeBetPercent = Math.round((threeBetCount / totalHands) * 100 * 10) / 10;
  const showdownWinRate = showdownCount > 0
    ? Math.round((showdownWins / showdownCount) * 100 * 10) / 10
    : 0;

  return {
    totalHands,
    winRate,
    vpip,
    pfr,
    threeBetPercent,
    avgProfitPerHand,
    totalProfit,
    handsWon,
    handsLost,
    biggestWin: Math.round(biggestWin * 100) / 100,
    biggestLoss: Math.round(biggestLoss * 100) / 100,
    showdownWinRate,
  };
}

/** Profit chart data point */
export interface ProfitDataPoint {
  readonly x: number;
  readonly y: number;
  readonly label?: string;
}

/**
 * Get profit chart data for visualization.
 */
export async function getProfitChart(
  dateFrom?: string,
  dateTo?: string,
  granularity: 'per_hand' | 'per_session' | 'per_day' = 'per_hand',
): Promise<{ dataPoints: ProfitDataPoint[] }> {
  let hands = await db.hands.orderBy('playedAt').toArray();

  if (dateFrom) hands = hands.filter(h => h.playedAt >= dateFrom);
  if (dateTo) hands = hands.filter(h => h.playedAt <= dateTo);

  if (granularity === 'per_hand') {
    let cumulative = 0;
    const dataPoints: ProfitDataPoint[] = hands.map((h, i) => {
      cumulative += h.result.userProfit ?? 0;
      return {
        x: i + 1,
        y: Math.round(cumulative * 100) / 100,
        label: `Hand ${h.handNumber}`,
      };
    });
    return { dataPoints };
  }

  if (granularity === 'per_session') {
    // Group by gameId
    const sessionMap = new Map<string, number>();
    for (const h of hands) {
      const prev = sessionMap.get(h.gameId) ?? 0;
      sessionMap.set(h.gameId, prev + (h.result.userProfit ?? 0));
    }
    let cumulative = 0;
    let idx = 0;
    const dataPoints: ProfitDataPoint[] = [];
    for (const [, profit] of sessionMap) {
      cumulative += profit;
      idx++;
      dataPoints.push({
        x: idx,
        y: Math.round(cumulative * 100) / 100,
        label: `Session ${idx}`,
      });
    }
    return { dataPoints };
  }

  // per_day
  const dayMap = new Map<string, number>();
  for (const h of hands) {
    const day = h.playedAt.slice(0, 10); // YYYY-MM-DD
    const prev = dayMap.get(day) ?? 0;
    dayMap.set(day, prev + (h.result.userProfit ?? 0));
  }
  let cumulative = 0;
  let idx = 0;
  const dataPoints: ProfitDataPoint[] = [];
  for (const [day, profit] of dayMap) {
    cumulative += profit;
    idx++;
    dataPoints.push({
      x: idx,
      y: Math.round(cumulative * 100) / 100,
      label: day,
    });
  }
  return { dataPoints };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function toSummary(record: StoredHandRecord): HandHistorySummary {
  const userPlayer = record.players.find(p => p.isUser);

  // Determine key action tag
  const keyAction = deriveKeyAction(record);

  return {
    id: record.id,
    handNumber: record.handNumber,
    position: userPlayer?.position ?? 'BTN',
    holeCards: userPlayer?.holeCards,
    result: record.result.userProfit ?? 0,
    keyAction,
    playedAt: record.playedAt,
  };
}

function deriveKeyAction(record: StoredHandRecord): string {
  const userPlayer = record.players.find(p => p.isUser);
  if (!userPlayer) return '';

  const allActions = [
    ...(record.actionsByStreet.preflop ?? []),
    ...(record.actionsByStreet.flop ?? []),
    ...(record.actionsByStreet.turn ?? []),
    ...(record.actionsByStreet.river ?? []),
  ];

  const userActions = allActions.filter(a => a.playerId === userPlayer.playerId);

  // Check for notable patterns
  const preflopRaises = (record.actionsByStreet.preflop ?? []).filter(
    a => a.action === 'raise' || a.action === 'all_in',
  );
  if (preflopRaises.length >= 3) return '3-bet pot';

  const riverActions = userActions.filter(a => a.street === 'river');
  if (riverActions.some(a => a.action === 'raise') && (record.result.userProfit ?? 0) > 0) {
    return 'river value bet';
  }
  if (riverActions.some(a => a.action === 'raise') && (record.result.userProfit ?? 0) < 0) {
    return 'river bluff';
  }

  if (userActions.some(a => a.action === 'all_in')) return 'all-in';
  if (!record.result.wentToShowdown && (record.result.userProfit ?? 0) > 0) return 'won without showdown';

  return '';
}
