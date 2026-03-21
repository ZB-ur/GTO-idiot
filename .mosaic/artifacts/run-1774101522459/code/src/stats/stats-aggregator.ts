// ============================================================
// Stats Aggregator — Computes aggregated statistics from hand history
// ============================================================

import type { Position, Street } from '../types/game';
import type {
  StatsOverview,
  PositionStats,
  StreetStats,
  ProfitTrend,
  ProfitTrendGroupBy,
  ProfitTrendDataPoint,
} from '../types/stats';
import { POSITIONS } from '../types/game';
import { handHistoryRepository } from '../persistence/hand-history-repository';
import { sessionRepository } from '../persistence/session-repository';
import type { HandHistoryRecord } from '../persistence/database';

// ============================================================
// Overview stats
// ============================================================

export async function getStatsOverview(): Promise<StatsOverview> {
  const records = await handHistoryRepository.getAll();
  const { total: totalSessions } = await sessionRepository.listAll();

  if (records.length === 0) {
    return {
      totalSessions,
      totalHands: 0,
      winRate: 0,
      cumulativeProfitLossBB: 0,
      cumulativeEvLossBB: 0,
      avgEvLossPerHandBB: 0,
    };
  }

  const totalHands = records.length;
  const wins = records.filter((r) => r.result === 'won').length;
  const winRate = (wins / totalHands) * 100;

  const cumulativeProfitLossBB = records.reduce(
    (sum, r) => sum + r.profitLossBB,
    0,
  );

  // Compute EV loss from decision point analyses stored in hand data
  const { totalEvLoss, handsWithEv } = computeEvLossFromRecords(records);
  const cumulativeEvLossBB = totalEvLoss;
  const avgEvLossPerHandBB = handsWithEv > 0 ? totalEvLoss / handsWithEv : 0;

  return {
    totalSessions,
    totalHands,
    winRate,
    cumulativeProfitLossBB,
    cumulativeEvLossBB,
    avgEvLossPerHandBB,
  };
}

// ============================================================
// Position stats
// ============================================================

export async function getStatsByPosition(): Promise<PositionStats[]> {
  const records = await handHistoryRepository.getAll();

  const positionMap = new Map<
    Position,
    { hands: number; wins: number; evLoss: number; evHands: number }
  >();

  for (const pos of POSITIONS) {
    positionMap.set(pos, { hands: 0, wins: 0, evLoss: 0, evHands: 0 });
  }

  for (const record of records) {
    const pos = record.userPosition as Position;
    const entry = positionMap.get(pos);
    if (!entry) continue;

    entry.hands++;
    if (record.result === 'won') {
      entry.wins++;
    }

    // EV loss from action sequence analysis (simplified: use profitLoss as proxy when no GTO data)
    const handEvLoss = computeHandEvLoss(record);
    if (handEvLoss !== null) {
      entry.evLoss += handEvLoss;
      entry.evHands++;
    }
  }

  return POSITIONS.map((pos) => {
    const entry = positionMap.get(pos)!;
    return {
      position: pos,
      handCount: entry.hands,
      winRate: entry.hands > 0 ? (entry.wins / entry.hands) * 100 : 0,
      evLossBB: entry.evLoss,
      avgEvLossPerHandBB: entry.evHands > 0 ? entry.evLoss / entry.evHands : 0,
    };
  });
}

// ============================================================
// Street stats
// ============================================================

export async function getStatsByStreet(): Promise<StreetStats[]> {
  const records = await handHistoryRepository.getAll();
  const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];

  const streetMap = new Map<
    Street,
    { decisions: number; evLoss: number }
  >();

  for (const street of streets) {
    streetMap.set(street, { decisions: 0, evLoss: 0 });
  }

  for (const record of records) {
    // Count user decisions per street from action sequence
    const humanSeat = record.data.seats.find((s) => s.isHuman);
    if (!humanSeat) continue;

    for (const action of record.data.actionSequence) {
      if (action.seat !== humanSeat.seat) continue;
      const entry = streetMap.get(action.street);
      if (entry) {
        entry.decisions++;
      }
    }
  }

  return streets.map((street) => {
    const entry = streetMap.get(street)!;
    return {
      street,
      decisionCount: entry.decisions,
      totalEvLossBB: entry.evLoss,
      avgEvLossPerDecisionBB:
        entry.decisions > 0 ? entry.evLoss / entry.decisions : 0,
    };
  });
}

// ============================================================
// Profit trend
// ============================================================

export async function getProfitTrend(
  groupBy: ProfitTrendGroupBy = 'hand',
  limit = 200,
): Promise<ProfitTrend> {
  if (groupBy === 'session') {
    return getSessionProfitTrend(limit);
  }
  return getHandProfitTrend(limit);
}

async function getHandProfitTrend(limit: number): Promise<ProfitTrend> {
  const records = await handHistoryRepository.getAll();

  // Records are already sorted by timestamp ascending
  let cumulativeProfit = 0;
  let cumulativeEvLoss = 0;

  // If more records than limit, sample evenly
  const sampled = sampleRecords(records, limit);

  // Iterate all records, emit data points at sampled indices
  const sampledSet = new Set(sampled.map((r) => r.id));
  const result: ProfitTrendDataPoint[] = [];
  cumulativeProfit = 0;
  cumulativeEvLoss = 0;
  let handIdx = 0;

  for (const record of records) {
    cumulativeProfit += record.profitLossBB;
    const evLoss = computeHandEvLoss(record);
    if (evLoss !== null) {
      cumulativeEvLoss += evLoss;
    }
    handIdx++;

    if (sampledSet.has(record.id)) {
      result.push({
        index: handIdx,
        label: `Hand #${record.handNumber ?? handIdx}`,
        cumulativeProfitBB: Math.round(cumulativeProfit * 100) / 100,
        evLossBB: Math.round(cumulativeEvLoss * 100) / 100,
      });
    }
  }

  return { groupBy: 'hand', dataPoints: result };
}

async function getSessionProfitTrend(limit: number): Promise<ProfitTrend> {
  const { sessions } = await sessionRepository.listAll();

  // Sessions come newest-first, reverse for chronological
  const chronological = [...sessions].reverse();
  const sampled = chronological.slice(0, limit);

  let cumulativeProfit = 0;
  const dataPoints: ProfitTrendDataPoint[] = sampled.map((session, idx) => {
    cumulativeProfit += session.profitLossBB;
    const date = new Date(session.startedAt);
    return {
      index: idx + 1,
      label: date.toLocaleDateString(),
      cumulativeProfitBB: Math.round(cumulativeProfit * 100) / 100,
      evLossBB: 0, // Session-level EV not tracked in summary
    };
  });

  return { groupBy: 'session', dataPoints };
}

// ============================================================
// Helpers
// ============================================================

function computeHandEvLoss(_record: HandHistoryRecord): number | null {
  // EV loss data would come from GTO batch evaluation stored alongside
  // the hand history. For now, we return 0 as a baseline since GTO
  // evaluation may not have been performed on every hand.
  // When GTO evaluation is available, this will be enhanced.
  return 0;
}

function computeEvLossFromRecords(
  records: HandHistoryRecord[],
): { totalEvLoss: number; handsWithEv: number } {
  let totalEvLoss = 0;
  let handsWithEv = 0;

  for (const record of records) {
    const evLoss = computeHandEvLoss(record);
    if (evLoss !== null) {
      totalEvLoss += evLoss;
      handsWithEv++;
    }
  }

  return { totalEvLoss, handsWithEv };
}

function sampleRecords<T>(records: T[], limit: number): T[] {
  if (records.length <= limit) return records;

  const result: T[] = [];
  const step = records.length / limit;
  for (let i = 0; i < limit; i++) {
    const idx = Math.min(Math.floor(i * step), records.length - 1);
    result.push(records[idx]);
  }

  // Always include the last record
  if (result[result.length - 1] !== records[records.length - 1]) {
    result[result.length - 1] = records[records.length - 1];
  }

  return result;
}
