// ============================================================
// GTO Idiot — Deviation Analyzer
// Compares user decisions against GTO strategy and produces
// a per-hand deviation analysis with severity classification.
// ============================================================

import type {
  HandHistory,
  HandHistoryAction,
  ActionRecord,
  ActionType,
  Card,
  Street,
  Position,
  Deviation,
  DeviationAnalysis,
  DeviationSeverity,
  GTOActionFrequency,
} from '../types';
import { getHand, updateHandDeviations } from '../storage/hand-repository';
import { getPreflopAdvice } from '../gto/preflop-advisor';
import { solvePostflop } from '../gto/postflop-solver';

// ============================================================
// Constants
// ============================================================

/** Deviation severity thresholds (frequency diff) */
const MINOR_THRESHOLD = 0.15;
const MODERATE_THRESHOLD = 0.40;

// ============================================================
// Public API
// ============================================================

/**
 * Analyze all of the user's decisions in a hand against GTO strategy.
 * Returns a DeviationAnalysis with per-decision-point deviations.
 */
export async function analyzeHandDeviations(handId: string): Promise<DeviationAnalysis> {
  const hand = await getHand(handId);
  if (!hand) {
    throw new Error(`Hand not found: ${handId}`);
  }

  return computeDeviations(hand);
}

/**
 * Compute deviations from an in-memory HandHistory (no DB lookup).
 */
export function computeDeviations(hand: HandHistory): DeviationAnalysis {
  const heroActions = hand.actions.filter((a) => a.is_hero);
  const deviations: Deviation[] = [];

  const heroPlayer = hand.players.find((p) => !p.is_bot);
  if (!heroPlayer || !heroPlayer.hole_cards) {
    return emptyAnalysis(hand.id);
  }

  const heroCards = heroPlayer.hole_cards;
  const heroPosition = hand.hero_position;

  let decisionPoint = 0;

  for (const heroAction of heroActions) {
    decisionPoint++;

    // Build action history up to (but not including) the hero's action
    const priorActions = hand.actions
      .filter((a) => a.sequence < heroAction.sequence)
      .map(toActionRecord);

    // Get GTO advice for this decision point
    const gtoAdvice = getGTOAdviceForDecision(
      heroCards,
      heroPosition,
      heroAction.street,
      hand.community_cards,
      priorActions,
      heroAction.pot_after,
      heroPlayer.starting_stack,
    );

    if (!gtoAdvice || gtoAdvice.length === 0) continue;

    // Compare hero's action to GTO frequencies
    const deviation = evaluateDecision(
      decisionPoint,
      heroAction,
      gtoAdvice,
    );

    if (deviation) {
      deviations.push(deviation);
    }
  }

  // Calculate totals
  const totalEvLoss = deviations.reduce((sum, d) => sum + d.ev_loss, 0);
  const counts = {
    minor: deviations.filter((d) => d.severity === 'minor').length,
    moderate: deviations.filter((d) => d.severity === 'moderate').length,
    severe: deviations.filter((d) => d.severity === 'severe').length,
  };

  // Update hand record with deviation info
  const hasDeviation = deviations.length > 0;
  const maxSeverity = getMaxSeverity(deviations);

  // Fire-and-forget DB update
  updateHandDeviations(hand.id, hasDeviation, maxSeverity).catch(() => {
    // silently ignore DB update failures
  });

  return {
    hand_id: hand.id,
    deviations,
    total_ev_loss: round2(totalEvLoss),
    deviation_count: counts,
  };
}

// ============================================================
// GTO advice retrieval
// ============================================================

function getGTOAdviceForDecision(
  heroCards: Card[],
  heroPosition: Position,
  street: Street,
  communityCards: Card[],
  priorActions: ActionRecord[],
  currentPot: number,
  heroStartingStack: number,
): GTOActionFrequency[] | null {
  try {
    if (street === 'preflop') {
      const advice = getPreflopAdvice({
        position: heroPosition,
        hole_cards: heroCards,
        action_history: priorActions,
      });
      return advice.actions;
    }

    // Postflop: use CFR solver
    const streetCommunity = getCommunityForStreet(communityCards, street);

    // Estimate effective stack from starting stack minus total invested so far
    const totalInvested = priorActions
      .filter((a) => a.position === heroPosition)
      .reduce((sum, a) => sum + (a.amount ?? 0), 0);
    const effectiveStack = Math.max(1, heroStartingStack - totalInvested);

    const result = solvePostflop(
      {
        hero_position: heroPosition,
        hero_cards: heroCards,
        community_cards: streetCommunity,
        pot: currentPot,
        effective_stack: effectiveStack,
        street,
        action_history: priorActions,
      },
      { timeBudgetMs: 300, maxIterations: 500 },
    );

    return result.advice.actions;
  } catch {
    return null;
  }
}

// ============================================================
// Decision evaluation
// ============================================================

function evaluateDecision(
  decisionPoint: number,
  heroAction: HandHistoryAction,
  gtoAdvice: GTOActionFrequency[],
): Deviation | null {
  const heroActionType = heroAction.action;

  // Find the GTO frequency for the action the hero actually took
  const heroGTOEntry = gtoAdvice.find((a) => a.action === heroActionType);
  const heroFrequency = heroGTOEntry?.frequency ?? 0;

  // Find the highest-frequency GTO action
  const bestGTO = gtoAdvice.reduce((best, a) =>
    a.frequency > best.frequency ? a : best,
    gtoAdvice[0],
  );

  // Frequency difference: how far off was the hero from the recommended action
  const frequencyDiff = bestGTO.frequency - heroFrequency;

  // If the hero chose the most frequent action, no deviation
  if (heroActionType === bestGTO.action && frequencyDiff < MINOR_THRESHOLD) {
    return null;
  }

  // If the hero's action had a reasonable GTO frequency, it's acceptable
  if (heroFrequency >= 0.3) {
    return null;
  }

  // Classify severity
  const severity = classifySeverity(frequencyDiff);

  // Estimate EV loss
  const heroEV = heroGTOEntry?.ev ?? 0;
  const bestEV = bestGTO.ev;
  const evLoss = Math.max(0, bestEV - heroEV);

  // Build human-readable description
  const description = buildDeviationDescription(
    heroActionType,
    bestGTO,
    gtoAdvice,
    heroAction.street,
  );

  return {
    decision_point: decisionPoint,
    street: heroAction.street,
    severity,
    hero_action: {
      action: heroActionType,
      amount: heroAction.amount,
    },
    gto_advice: gtoAdvice,
    frequency_diff: round2(frequencyDiff),
    ev_loss: round2(evLoss),
    description,
  };
}

function classifySeverity(frequencyDiff: number): DeviationSeverity {
  if (frequencyDiff >= MODERATE_THRESHOLD) return 'severe';
  if (frequencyDiff >= MINOR_THRESHOLD) return 'moderate';
  return 'minor';
}

function buildDeviationDescription(
  heroAction: ActionType,
  bestGTO: GTOActionFrequency,
  _allAdvice: GTOActionFrequency[],
  street: Street,
): string {
  const streetLabel = streetToLabel(street);
  const heroLabel = actionToLabel(heroAction);
  const bestLabel = actionToLabel(bestGTO.action);
  const bestPct = Math.round(bestGTO.frequency * 100);

  if (bestGTO.bet_size) {
    return `${streetLabel}GTO建议${bestLabel}${bestGTO.bet_size}频率为${bestPct}%，你选择了${heroLabel}`;
  }

  return `${streetLabel}GTO建议${bestLabel}频率为${bestPct}%，你选择了${heroLabel}`;
}

// ============================================================
// Helpers
// ============================================================

function getCommunityForStreet(allCards: Card[], street: Street): Card[] {
  switch (street) {
    case 'preflop': return [];
    case 'flop': return allCards.slice(0, 3);
    case 'turn': return allCards.slice(0, 4);
    case 'river': return allCards.slice(0, 5);
  }
}

function toActionRecord(action: HandHistoryAction): ActionRecord {
  return {
    seat: action.seat,
    position: action.position,
    action: action.action,
    amount: action.amount,
    street: action.street,
  };
}

function getMaxSeverity(deviations: Deviation[]): DeviationSeverity | null {
  if (deviations.length === 0) return null;

  const order: DeviationSeverity[] = ['severe', 'moderate', 'minor'];
  for (const sev of order) {
    if (deviations.some((d) => d.severity === sev)) return sev;
  }
  return 'minor';
}

function emptyAnalysis(handId: string): DeviationAnalysis {
  return {
    hand_id: handId,
    deviations: [],
    total_ev_loss: 0,
    deviation_count: { minor: 0, moderate: 0, severe: 0 },
  };
}

function streetToLabel(street: Street): string {
  const labels: Record<Street, string> = {
    preflop: '翻前',
    flop: '翻牌',
    turn: '转牌',
    river: '河牌',
  };
  return labels[street];
}

function actionToLabel(action: ActionType): string {
  const labels: Record<ActionType, string> = {
    fold: '弃牌',
    check: '过牌',
    call: '跟注',
    raise: '加注',
    all_in: '全下',
  };
  return labels[action];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
