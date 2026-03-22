/**
 * ReviewService — Post-game review with GTO comparison annotations.
 *
 * Provides hand-level and session-level review by comparing the human player's
 * actions against GTO recommendations. Each decision point is annotated with
 * deviation level and estimated EV loss.
 */

import type {
  ActionType,
  Card,
  Position,
  Street,
  StreetRecord,
} from '../types';
import type {
  DeviationLevel,
  GTOComparison,
  HandReview,
  ReviewAction,
  ReviewStreet,
  SessionReview,
} from '../types/review';
import { handRepository } from '../persistence';
import { estimateEV, computeOverallConformance, computeConformancePercent } from './ev-estimator';
import { lookupPreflopAction } from '../gto/preflop-tables';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert two hole cards into a standard hand notation like "AKs", "QJo", "TT".
 */
function cardsToHandNotation(cards: [Card, Card]): string {
  const rankOrder = 'AKQJT98765432';
  const [c1, c2] = cards;
  const r1 = c1.rank;
  const r2 = c2.rank;

  const idx1 = rankOrder.indexOf(r1);
  const idx2 = rankOrder.indexOf(r2);

  // Order high card first
  const high = idx1 <= idx2 ? r1 : r2;
  const low = idx1 <= idx2 ? r2 : r1;

  if (r1 === r2) return `${r1}${r2}`; // Pair
  const suited = c1.suit === c2.suit;
  return `${high}${low}${suited ? 's' : 'o'}`;
}

/**
 * Determine the preflop scenario based on prior actions in the street.
 * Simplified: count raises before the human's action.
 */
function determinePreflopScenario(
  streetRecord: StreetRecord,
  humanPlayerId: string
): 'open' | 'vs_raise' | 'vs_3bet' | 'vs_4bet' {
  let raiseCount = 0;
  for (const action of streetRecord.actions) {
    if (action.playerId === humanPlayerId) break;
    if (action.actionType === 'raise' || action.actionType === 'bet' || action.actionType === 'all_in') {
      raiseCount++;
    }
  }

  if (raiseCount === 0) return 'open';
  if (raiseCount === 1) return 'vs_raise';
  if (raiseCount === 2) return 'vs_3bet';
  return 'vs_4bet';
}

/**
 * Map a GTO preflop action ('fold' | 'call' | 'raise' | 'all_in') to ActionType.
 */
function preflopActionToActionType(action: string): ActionType {
  switch (action) {
    case 'raise': return 'raise';
    case 'call': return 'call';
    case 'all_in': return 'all_in';
    case 'fold':
    default:
      return 'fold';
  }
}

/**
 * Build a GTO comparison for a human action on the preflop street.
 */
async function buildPreflopComparison(
  humanAction: ActionType,
  humanAmount: number | undefined,
  humanPosition: Position,
  holeCards: [Card, Card],
  streetRecord: StreetRecord,
  humanPlayerId: string,
  potSize: number
): Promise<GTOComparison | null> {
  const handNotation = cardsToHandNotation(holeCards);
  const scenario = determinePreflopScenario(streetRecord, humanPlayerId);

  const gtoResult = await lookupPreflopAction(handNotation, humanPosition, scenario);
  if (!gtoResult) return null;

  const gtoActionType = preflopActionToActionType(gtoResult.action);

  const evResult = estimateEV({
    userAction: humanAction,
    userAmount: humanAmount,
    gtoAction: gtoActionType,
    gtoAmount: gtoResult.sizing ? parseSizing(gtoResult.sizing) : undefined,
    potSize,
    street: 'preflop',
  });

  return {
    userAction: { actionType: humanAction, amount: humanAmount },
    gtoAction: {
      actionType: gtoActionType,
      amount: gtoResult.sizing ? parseSizing(gtoResult.sizing) : undefined,
      sizing: gtoResult.sizing,
    },
    deviationLevel: evResult.deviationLevel,
    evLoss: evResult.evLoss,
    explanation: evResult.explanation,
  };
}

/**
 * Build a simplified GTO comparison for postflop actions.
 * Uses a heuristic approach since full postflop GTO requires solver data.
 */
function buildPostflopComparison(
  humanAction: ActionType,
  humanAmount: number | undefined,
  potSize: number,
  street: Street
): GTOComparison {
  // For postflop, we use a simplified heuristic:
  // Without full solver data, we mark most actions as conforming
  // and only flag obvious deviations (e.g., min-bets into huge pots).
  const evResult = estimateEV({
    userAction: humanAction,
    userAmount: humanAmount,
    gtoAction: humanAction, // Assume conforming by default for postflop
    gtoAmount: humanAmount,
    potSize,
    street,
  });

  return {
    userAction: { actionType: humanAction, amount: humanAmount },
    gtoAction: { actionType: humanAction, amount: humanAmount },
    deviationLevel: evResult.deviationLevel,
    evLoss: evResult.evLoss,
    explanation: evResult.explanation,
  };
}

/**
 * Parse a sizing string like "2.5BB" into a number.
 */
function parseSizing(sizing: string): number | undefined {
  const match = sizing.match(/([\d.]+)\s*BB/i);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Compute pot size at a given point in a street's action list.
 */
function computePotAtAction(streets: StreetRecord[], streetIdx: number, actionIdx: number): number {
  let pot = 0;

  // Sum all prior streets
  for (let s = 0; s < streetIdx; s++) {
    pot = streets[s].potAtEnd ?? pot;
  }

  // Sum actions in current street up to this action
  const currentStreet = streets[streetIdx];
  for (let a = 0; a <= actionIdx; a++) {
    const action = currentStreet.actions[a];
    if (action.potAfterAction !== undefined) {
      pot = action.potAfterAction;
    }
  }

  return Math.max(pot, 1);
}

// ─── Service ────────────────────────────────────────────────────────────────

export const reviewService = {
  /**
   * Get a hand review with GTO comparison for every human decision point.
   * Implements: getHandReview (F-007)
   */
  async getHandReview(sessionId: string, handId: string): Promise<HandReview> {
    const hand = await handRepository.getById(handId);

    // Validate session ownership
    if (hand.sessionId !== sessionId) {
      throw { code: 'NOT_FOUND' as const, message: `Hand ${handId} not found in session ${sessionId}` };
    }

    const humanPlayer = hand.players.find((p) => !p.isBot);
    if (!humanPlayer) {
      throw { code: 'DATA_CORRUPTION' as const, message: 'No human player found in hand history' };
    }

    const reviewStreets: ReviewStreet[] = [];
    const allDeviations: DeviationLevel[] = [];
    let totalEvLoss = 0;

    for (let sIdx = 0; sIdx < hand.streets.length; sIdx++) {
      const streetRecord = hand.streets[sIdx];
      if (streetRecord.street === 'showdown') continue;

      const reviewActions: ReviewAction[] = [];

      for (let aIdx = 0; aIdx < streetRecord.actions.length; aIdx++) {
        const action = streetRecord.actions[aIdx];
        const isHuman = action.playerId === humanPlayer.playerId;

        const reviewAction: ReviewAction = {
          playerId: action.playerId,
          playerName: action.playerName,
          position: action.position,
          actionType: action.actionType,
          amount: action.amount,
          isHumanAction: isHuman,
        };

        if (isHuman) {
          const potSize = computePotAtAction(hand.streets, sIdx, aIdx);

          let comparison: GTOComparison | null = null;

          if (streetRecord.street === 'preflop') {
            comparison = await buildPreflopComparison(
              action.actionType,
              action.amount,
              humanPlayer.position,
              humanPlayer.holeCards,
              streetRecord,
              humanPlayer.playerId,
              potSize
            );
          } else {
            comparison = buildPostflopComparison(
              action.actionType,
              action.amount,
              potSize,
              streetRecord.street
            );
          }

          if (comparison) {
            reviewAction.gtoComparison = comparison;
            allDeviations.push(comparison.deviationLevel);
            totalEvLoss += comparison.evLoss ?? 0;
          }
        }

        reviewActions.push(reviewAction);
      }

      reviewStreets.push({
        street: streetRecord.street,
        communityCards: streetRecord.communityCards,
        potAtStart: sIdx > 0 ? (hand.streets[sIdx - 1].potAtEnd ?? 0) : 0,
        actions: reviewActions,
      });
    }

    totalEvLoss = Math.round(totalEvLoss * 10) / 10;

    return {
      handId: hand.handId,
      handNumber: hand.handNumber,
      streets: reviewStreets,
      overallConformance: computeOverallConformance(allDeviations),
      totalEvLoss,
      humanPosition: humanPlayer.position,
      humanHoleCards: humanPlayer.holeCards,
    };
  },

  /**
   * Get a session-level review summary aggregated across all hands.
   * Implements: getSessionReview (F-007)
   */
  async getSessionReview(sessionId: string): Promise<SessionReview> {
    const hands = await handRepository.getAllBySession(sessionId);

    if (hands.length === 0) {
      return {
        sessionId,
        handsReviewed: 0,
        overallConformance: 100,
        totalEvLoss: 0,
      };
    }

    const allDeviations: DeviationLevel[] = [];
    let totalEvLoss = 0;

    // Per-street tracking
    const streetDeviations: Record<string, DeviationLevel[]> = {
      preflop: [],
      flop: [],
      turn: [],
      river: [],
    };

    // Track biggest deviations
    const deviationPoints: Array<{
      handId: string;
      handNumber: number;
      street: Street;
      evLoss: number;
      description: string;
    }> = [];

    for (const hand of hands) {
      try {
        const review = await this.getHandReview(sessionId, hand.handId);

        for (const street of review.streets) {
          for (const action of street.actions) {
            if (action.isHumanAction && action.gtoComparison) {
              const { deviationLevel, evLoss, explanation } = action.gtoComparison;
              allDeviations.push(deviationLevel);
              totalEvLoss += evLoss ?? 0;

              const streetKey = street.street as string;
              if (streetDeviations[streetKey]) {
                streetDeviations[streetKey].push(deviationLevel);
              }

              if (deviationLevel !== 'conforming' && (evLoss ?? 0) > 0) {
                deviationPoints.push({
                  handId: hand.handId,
                  handNumber: hand.handNumber,
                  street: street.street,
                  evLoss: evLoss ?? 0,
                  description: explanation ?? '',
                });
              }
            }
          }
        }
      } catch {
        // Skip hands that fail review (e.g., missing data)
        continue;
      }
    }

    // Sort deviations by EV loss descending, take top 5
    deviationPoints.sort((a, b) => b.evLoss - a.evLoss);
    const biggestDeviations = deviationPoints.slice(0, 5);

    // Compute per-street conformance
    const streetBreakdown: SessionReview['streetBreakdown'] = {};
    for (const [street, devs] of Object.entries(streetDeviations)) {
      if (devs.length > 0) {
        (streetBreakdown as Record<string, number>)[street] = computeConformancePercent(devs);
      }
    }

    totalEvLoss = Math.round(totalEvLoss * 10) / 10;

    return {
      sessionId,
      handsReviewed: hands.length,
      overallConformance: computeConformancePercent(allDeviations),
      totalEvLoss,
      streetBreakdown: Object.keys(streetBreakdown ?? {}).length > 0 ? streetBreakdown : undefined,
      biggestDeviations: biggestDeviations.length > 0 ? biggestDeviations : undefined,
    };
  },
};
