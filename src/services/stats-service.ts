/**
 * StatsService — Aggregated analytics across sessions and hands.
 *
 * Provides summary stats, conformance trends, position/street breakdowns,
 * and top deviation patterns for the Stats dashboard (F-008).
 */

import type { Position } from '../types';
import type {
  StatsSummary,
  ConformanceTrend,
  ConformanceTrendPoint,
  PositionBreakdown,
  PositionBreakdownEntry,
  StreetBreakdown,
  StreetBreakdownEntry,
  TopDeviations,
  DeviationEntry,
  StatsQueryParams,
} from '../types/stats';
import type { DeviationLevel } from '../types/review';
import { sessionRepository, handRepository } from '../persistence';
import type { Session } from '../types/session';
import type { HandHistory } from '../types';
import { reviewService } from './review-service';
import { computeConformancePercent } from './ev-estimator';

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Filter sessions by query params (date range, specific IDs).
 */
async function getFilteredSessions(params: StatsQueryParams = {}): Promise<Session[]> {
  const { dateFrom, dateTo, sessionIds } = params;

  const result = await sessionRepository.list({ limit: 10000, sortBy: 'date', sortOrder: 'asc' });
  let sessions = await Promise.all(
    result.sessions.map((s) => sessionRepository.getById(s.id))
  );

  if (sessionIds && sessionIds.length > 0) {
    const idSet = new Set(sessionIds);
    sessions = sessions.filter((s) => idSet.has(s.id));
  }

  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    sessions = sessions.filter((s) => new Date(s.startedAt).getTime() >= from);
  }

  if (dateTo) {
    const to = new Date(dateTo).getTime() + 86400000; // Include the end date
    sessions = sessions.filter((s) => new Date(s.startedAt).getTime() < to);
  }

  return sessions;
}

/**
 * Collect all human decision deviations from a hand review.
 */
async function collectHandDeviations(
  sessionId: string,
  hand: HandHistory
): Promise<{
  deviations: DeviationLevel[];
  evLosses: number[];
  byStreet: Record<string, DeviationLevel[]>;
  byPosition: Record<string, DeviationLevel[]>;
  deviationTypes: Array<{
    type: string;
    description: string;
    evLoss: number;
    street: string;
    handId: string;
    sessionId: string;
  }>;
  netResult: number;
}> {
  const result = {
    deviations: [] as DeviationLevel[],
    evLosses: [] as number[],
    byStreet: {} as Record<string, DeviationLevel[]>,
    byPosition: {} as Record<string, DeviationLevel[]>,
    deviationTypes: [] as Array<{
      type: string;
      description: string;
      evLoss: number;
      street: string;
      handId: string;
      sessionId: string;
    }>,
    netResult: hand.result.humanNetResult ?? 0,
  };

  try {
    const review = await reviewService.getHandReview(sessionId, hand.handId);
    const humanPosition = review.humanPosition ?? 'UTG';

    for (const street of review.streets) {
      const streetKey = street.street as string;

      for (const action of street.actions) {
        if (!action.isHumanAction || !action.gtoComparison) continue;

        const { deviationLevel, evLoss } = action.gtoComparison;
        result.deviations.push(deviationLevel);
        result.evLosses.push(evLoss ?? 0);

        // By street
        if (!result.byStreet[streetKey]) result.byStreet[streetKey] = [];
        result.byStreet[streetKey].push(deviationLevel);

        // By position
        const posKey = humanPosition;
        if (!result.byPosition[posKey]) result.byPosition[posKey] = [];
        result.byPosition[posKey].push(deviationLevel);

        // Categorize deviation type
        if (deviationLevel !== 'conforming') {
          const deviationType = categorizeDeviation(
            action.gtoComparison.userAction.actionType,
            action.gtoComparison.gtoAction.actionType,
            streetKey
          );
          result.deviationTypes.push({
            type: deviationType.type,
            description: deviationType.description,
            evLoss: evLoss ?? 0,
            street: streetKey,
            handId: hand.handId,
            sessionId,
          });
        }
      }
    }
  } catch {
    // If review fails, skip this hand
  }

  return result;
}

/**
 * Categorize a deviation into a named pattern.
 */
function categorizeDeviation(
  userAction: string,
  gtoAction: string,
  street: string
): { type: string; description: string } {
  const streetLabel: Record<string, string> = {
    preflop: 'Preflop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
  };
  const label = streetLabel[street] ?? street;

  // Fold when should have played
  if (userAction === 'fold' && (gtoAction === 'call' || gtoAction === 'raise')) {
    return {
      type: `${street}_over_fold`,
      description: `${label} 弃牌过多`,
    };
  }

  // Call when should have raised
  if (userAction === 'call' && (gtoAction === 'raise' || gtoAction === 'bet')) {
    return {
      type: `${street}_passive_call`,
      description: `${label} 冷跟注过多`,
    };
  }

  // Raise/bet when should have checked/called
  if ((userAction === 'raise' || userAction === 'bet') && (gtoAction === 'check' || gtoAction === 'call')) {
    return {
      type: `${street}_over_aggression`,
      description: `${label} 过度激进`,
    };
  }

  // Check when should have bet
  if (userAction === 'check' && (gtoAction === 'bet' || gtoAction === 'raise')) {
    return {
      type: `${street}_missed_bet`,
      description: `${label} 错失下注机会`,
    };
  }

  // Generic deviation
  return {
    type: `${street}_deviation`,
    description: `${label} GTO 偏差`,
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export const statsService = {
  /**
   * Get overall statistics summary.
   * Implements: getStatsSummary (F-008)
   */
  async getStatsSummary(params: StatsQueryParams = {}): Promise<StatsSummary> {
    const sessions = await getFilteredSessions(params);

    if (sessions.length === 0) {
      return {
        totalHands: 0,
        totalSessions: 0,
        netProfitLossBB: 0,
        overallGTOConformance: 100,
      };
    }

    let totalHands = 0;
    let netProfitLossBB = 0;
    const allDeviations: DeviationLevel[] = [];

    for (const session of sessions) {
      const hands = await handRepository.getAllBySession(session.id);
      totalHands += hands.length;

      for (const hand of hands) {
        netProfitLossBB += hand.result.humanNetResult ?? 0;
        const handData = await collectHandDeviations(session.id, hand);
        allDeviations.push(...handData.deviations);
      }
    }

    return {
      totalHands,
      totalSessions: sessions.length,
      netProfitLossBB: Math.round(netProfitLossBB * 10) / 10,
      overallGTOConformance: computeConformancePercent(allDeviations),
    };
  },

  /**
   * Get GTO conformance trend over time (per session).
   * Implements: getConformanceTrend (F-008)
   */
  async getConformanceTrend(params: StatsQueryParams = {}): Promise<ConformanceTrend> {
    const sessions = await getFilteredSessions(params);
    const dataPoints: ConformanceTrendPoint[] = [];

    for (const session of sessions) {
      const hands = await handRepository.getAllBySession(session.id);
      const sessionDeviations: DeviationLevel[] = [];
      let netPL = 0;

      for (const hand of hands) {
        const handData = await collectHandDeviations(session.id, hand);
        sessionDeviations.push(...handData.deviations);
        netPL += handData.netResult;
      }

      dataPoints.push({
        sessionId: session.id,
        date: session.startedAt,
        conformance: computeConformancePercent(sessionDeviations),
        handsPlayed: hands.length,
        netProfitLossBB: Math.round(netPL * 10) / 10,
      });
    }

    // Sort by date ascending
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { dataPoints };
  },

  /**
   * Get GTO conformance broken down by table position.
   * Implements: getPositionBreakdown (F-008)
   */
  async getPositionBreakdown(params: StatsQueryParams = {}): Promise<PositionBreakdown> {
    const sessions = await getFilteredSessions(params);

    const positionData: Record<string, {
      deviations: DeviationLevel[];
      handsPlayed: number;
      netPL: number;
    }> = {};

    // Initialize all positions
    const allPositions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of allPositions) {
      positionData[pos] = { deviations: [], handsPlayed: 0, netPL: 0 };
    }

    for (const session of sessions) {
      const hands = await handRepository.getAllBySession(session.id);

      for (const hand of hands) {
        const humanPlayer = hand.players.find((p) => !p.isBot);
        if (!humanPlayer) continue;

        const pos = humanPlayer.position;
        if (!positionData[pos]) {
          positionData[pos] = { deviations: [], handsPlayed: 0, netPL: 0 };
        }

        positionData[pos].handsPlayed++;
        positionData[pos].netPL += hand.result.humanNetResult ?? 0;

        const handData = await collectHandDeviations(session.id, hand);
        positionData[pos].deviations.push(...handData.deviations);
      }
    }

    const positions: PositionBreakdownEntry[] = allPositions.map((position) => {
      const data = positionData[position];
      return {
        position,
        conformance: computeConformancePercent(data.deviations),
        handsPlayed: data.handsPlayed,
        netProfitLossBB: Math.round(data.netPL * 10) / 10,
      };
    });

    return { positions };
  },

  /**
   * Get GTO conformance broken down by street.
   * Implements: getStreetBreakdown (F-008)
   */
  async getStreetBreakdown(params: StatsQueryParams = {}): Promise<StreetBreakdown> {
    const sessions = await getFilteredSessions(params);

    const streetData: Record<string, DeviationLevel[]> = {
      preflop: [],
      flop: [],
      turn: [],
      river: [],
    };

    for (const session of sessions) {
      const hands = await handRepository.getAllBySession(session.id);

      for (const hand of hands) {
        const handData = await collectHandDeviations(session.id, hand);
        for (const [street, devs] of Object.entries(handData.byStreet)) {
          if (streetData[street]) {
            streetData[street].push(...devs);
          }
        }
      }
    }

    const streetOrder: Array<'preflop' | 'flop' | 'turn' | 'river'> = ['preflop', 'flop', 'turn', 'river'];
    const streets: StreetBreakdownEntry[] = streetOrder.map((street) => ({
      street,
      conformance: computeConformancePercent(streetData[street]),
      decisionCount: streetData[street].length,
    }));

    return { streets };
  },

  /**
   * Get most common GTO deviation types ranked by frequency.
   * Implements: getTopDeviations (F-008)
   */
  async getTopDeviations(
    params: StatsQueryParams & { limit?: number } = {}
  ): Promise<TopDeviations> {
    const { limit = 10, ...queryParams } = params;
    const sessions = await getFilteredSessions(queryParams);

    // Collect all deviation instances
    const deviationMap: Record<string, {
      type: string;
      description: string;
      count: number;
      totalEvLoss: number;
      street?: string;
      examples: Array<{ handId: string; sessionId: string }>;
    }> = {};

    for (const session of sessions) {
      const hands = await handRepository.getAllBySession(session.id);

      for (const hand of hands) {
        const handData = await collectHandDeviations(session.id, hand);

        for (const dev of handData.deviationTypes) {
          if (!deviationMap[dev.type]) {
            deviationMap[dev.type] = {
              type: dev.type,
              description: dev.description,
              count: 0,
              totalEvLoss: 0,
              street: dev.street as 'preflop' | 'flop' | 'turn' | 'river' | undefined,
              examples: [],
            };
          }

          const entry = deviationMap[dev.type];
          entry.count++;
          entry.totalEvLoss += dev.evLoss;

          if (entry.examples.length < 3) {
            entry.examples.push({ handId: dev.handId, sessionId: dev.sessionId });
          }
        }
      }
    }

    // Convert to array, compute averages, sort by count
    const deviations: DeviationEntry[] = Object.values(deviationMap)
      .map((entry) => ({
        type: entry.type,
        description: entry.description,
        count: entry.count,
        averageEvLoss: Math.round((entry.totalEvLoss / entry.count) * 10) / 10,
        street: entry.street as 'preflop' | 'flop' | 'turn' | 'river' | undefined,
        examples: entry.examples.length > 0 ? entry.examples : undefined,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { deviations };
  },
};
