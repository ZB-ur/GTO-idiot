// ============================================================
// Batch Evaluator — Evaluate all decision points in a hand
// ============================================================
//
// Processes a completed hand's history and evaluates every user
// decision point against GTO strategy. Used for post-hand replay
// and analysis.

import type {
  Card,
  ActionLogEntry,
  HandHistory,
  Position,
  Street,
} from '../types';
import type {
  GTOEvaluationRequest,
  GTOEvaluationResult,
  GTOBatchResult,
  DecisionPointAnalysis,
  GameSnapshot,
} from '../types';
import { classifyDecisionQuality } from '../types';
import { GTOClient, getGTOClient } from './gto-client';
import { getRecommendedPreflopAction } from './preflop-ranges';
import { holeCardsToCombo, lookupComboFrequency } from './preflop-range-data';

/**
 * Evaluate all user decision points in a completed hand.
 * Returns GTO analysis for each point where the human player acted.
 */
export async function batchEvaluateHand(
  handHistory: HandHistory,
  client?: GTOClient
): Promise<GTOBatchResult> {
  const gtoClient = client ?? getGTOClient();
  const userSeat = findUserSeat(handHistory);

  if (userSeat === -1) {
    return {
      handId: handHistory.id,
      decisionPoints: [],
      totalEvLossBB: 0,
    };
  }

  const userRecord = handHistory.seats.find((s) => s.seat === userSeat)!;
  const userHoleCards = userRecord.holeCards as [Card, Card];
  const userPosition = userRecord.position;

  // Extract user decision points from action sequence
  const decisionPoints: DecisionPointAnalysis[] = [];
  let decisionIndex = 0;

  // Build progressive action history
  const progressiveHistory: ActionLogEntry[] = [];

  for (let i = 0; i < handHistory.actionSequence.length; i++) {
    const action = handHistory.actionSequence[i];

    if (action.seat === userSeat) {
      const street = action.street;
      const snapshot = buildSnapshot(handHistory, progressiveHistory, userSeat, userPosition, userHoleCards);
      const communityCards = getCommunityCardsForStreet(handHistory.communityCards, street);

      // Evaluate this decision point
      let gtoEvaluation: GTOEvaluationResult;

      if (street === 'preflop') {
        gtoEvaluation = evaluatePreflopDecision(userHoleCards, userPosition, progressiveHistory);
      } else {
        const request: GTOEvaluationRequest = {
          holeCards: userHoleCards,
          communityCards,
          position: userPosition,
          potBB: snapshot.potBB,
          stackBB: getUserStack(handHistory, progressiveHistory, userSeat),
          street,
          activePlayers: snapshot.playerStacks.filter((p) => p.isActive).length,
          actionHistory: [...progressiveHistory],
        };
        gtoEvaluation = await gtoClient.evaluate(request);
      }

      // Find user's action EV
      const userActionEV = findActionEV(gtoEvaluation, action.action, action.amount);
      const bestEV = Math.max(...gtoEvaluation.actions.map((a) => a.evBB));
      const evDiffBB = userActionEV - bestEV;

      decisionPoints.push({
        index: decisionIndex++,
        street,
        gameSnapshot: snapshot,
        userAction: {
          type: action.action,
          amount: action.amount,
          evBB: userActionEV,
        },
        gtoEvaluation,
        evDiffBB: Math.round(evDiffBB * 100) / 100,
        quality: classifyDecisionQuality(evDiffBB),
      });
    }

    progressiveHistory.push(action);
  }

  const totalEvLossBB = decisionPoints.reduce(
    (sum, dp) => sum + Math.min(0, dp.evDiffBB),
    0
  );

  return {
    handId: handHistory.id,
    decisionPoints,
    totalEvLossBB: Math.round(totalEvLossBB * 100) / 100,
  };
}

// ============================================================
// Preflop evaluation helper
// ============================================================

function evaluatePreflopDecision(
  holeCards: [Card, Card],
  position: Position,
  priorActions: ActionLogEntry[]
): GTOEvaluationResult {
  // Determine scenario from prior actions
  const scenario = determinePreflopScenario(priorActions);
  const combo = holeCardsToCombo(holeCards);
  const freq = lookupComboFrequency(combo, position, scenario);

  const recommended = getRecommendedPreflopAction(holeCards, position, scenario);

  // Build EV estimates from frequencies (approximate: raise > call > fold)
  const actions = [];

  if (freq.fold > 0) {
    actions.push({ action: 'fold' as const, amount: null, evBB: 0, frequency: freq.fold });
  }
  if (freq.call > 0) {
    actions.push({ action: 'call' as const, amount: 1, evBB: freq.call * 2, frequency: freq.call });
  }
  if (freq.raise > 0) {
    actions.push({ action: 'raise' as const, amount: 3, evBB: freq.raise * 3.5, frequency: freq.raise });
  }

  // If no actions were added (shouldn't happen), add fold
  if (actions.length === 0) {
    actions.push({ action: 'fold' as const, amount: null, evBB: 0, frequency: 1 });
  }

  const mapAction = (a: 'fold' | 'call' | 'raise') => {
    if (a === 'raise') return 'raise' as const;
    return a;
  };

  return {
    actions,
    recommendedAction: mapAction(recommended.action),
    recommendedAmount: recommended.action === 'raise' ? 3 : null,
    handStrength: freq.raise + freq.call * 0.7,
    potOdds: 0,
    spr: 99,
    isDegraded: false,
  };
}

function determinePreflopScenario(
  priorActions: ActionLogEntry[]
): 'open' | 'vs_open' | 'vs_3bet' | 'vs_4bet' {
  const preflopActions = priorActions.filter((a) => a.street === 'preflop');
  const raises = preflopActions.filter(
    (a) => a.action === 'raise' || a.action === 'bet'
  );

  if (raises.length >= 3) return 'vs_4bet';
  if (raises.length === 2) return 'vs_3bet';
  if (raises.length === 1) return 'vs_open';
  return 'open';
}

// ============================================================
// Snapshot builders
// ============================================================

function buildSnapshot(
  hand: HandHistory,
  actionsUpToNow: ActionLogEntry[],
  _userSeat: number,
  userPosition: Position,
  userHoleCards: Card[]
): GameSnapshot {
  const lastStreet = actionsUpToNow.length > 0
    ? actionsUpToNow[actionsUpToNow.length - 1].street
    : 'preflop';

  const communityCards = getCommunityCardsForStreet(hand.communityCards, lastStreet);
  const potBB = computePot(actionsUpToNow, hand.blinds.bigBlind);

  const playerStacks = hand.seats.map((seat) => {
    const totalBet = actionsUpToNow
      .filter((a) => a.seat === seat.seat && a.amount !== null)
      .reduce((sum, a) => sum + (a.amount ?? 0), 0);
    const hasFolded = actionsUpToNow.some(
      (a) => a.seat === seat.seat && a.action === 'fold'
    );
    return {
      seat: seat.seat,
      stackBB: seat.startingStackBB - totalBet,
      isActive: !hasFolded,
    };
  });

  return {
    communityCards,
    potBB,
    playerStacks,
    userPosition,
    userHoleCards,
  };
}

function getCommunityCardsForStreet(allCommunity: Card[], street: Street): Card[] {
  switch (street) {
    case 'preflop': return [];
    case 'flop': return allCommunity.slice(0, 3);
    case 'turn': return allCommunity.slice(0, 4);
    case 'river': return allCommunity.slice(0, 5);
    default: return allCommunity;
  }
}

function computePot(actions: ActionLogEntry[], _bigBlind: number): number {
  if (actions.length === 0) return 1.5; // SB + BB
  // Use the last action's potAfter value
  const last = actions[actions.length - 1];
  return last.potAfter ?? 1.5;
}

function getUserStack(
  hand: HandHistory,
  actions: ActionLogEntry[],
  userSeat: number
): number {
  const userRecord = hand.seats.find((s) => s.seat === userSeat);
  if (!userRecord) return 100;

  const totalBet = actions
    .filter((a) => a.seat === userSeat && a.amount !== null)
    .reduce((sum, a) => sum + (a.amount ?? 0), 0);

  return userRecord.startingStackBB - totalBet;
}

function findUserSeat(hand: HandHistory): number {
  const humanSeat = hand.seats.find((s) => s.isHuman);
  return humanSeat?.seat ?? -1;
}

function findActionEV(
  evaluation: GTOEvaluationResult,
  actionType: string,
  amount: number | null
): number {
  // Try exact match first
  const exact = evaluation.actions.find(
    (a) => a.action === actionType && (a.amount === amount || a.amount === null)
  );
  if (exact) return exact.evBB;

  // Match by action type only
  const byType = evaluation.actions.find((a) => a.action === actionType);
  if (byType) return byType.evBB;

  // Map fold to 0 EV
  if (actionType === 'fold') return 0;

  // Default: worst EV
  return Math.min(...evaluation.actions.map((a) => a.evBB));
}
