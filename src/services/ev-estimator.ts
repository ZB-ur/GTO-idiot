/**
 * EV (Expected Value) Estimator
 *
 * Estimates EV loss when a player's action deviates from GTO recommendations.
 * Uses simplified heuristics based on pot size, action type differences,
 * and street context.
 */

import type { ActionType, Street } from '../types/poker';
import type { DeviationLevel } from '../types/review';

/** Weights for EV impact by street — later streets have larger pots and higher impact. */
const STREET_MULTIPLIER: Record<string, number> = {
  preflop: 0.5,
  flop: 1.0,
  turn: 1.5,
  river: 2.0,
};

/**
 * Action severity matrix: maps (userAction, gtoAction) to a base EV loss factor.
 * Higher values = worse deviation. The factor is multiplied by the pot context.
 */
const ACTION_SEVERITY: Record<string, Record<string, number>> = {
  fold: { call: 0.8, bet: 1.2, raise: 1.5, check: 0.6, all_in: 2.0 },
  check: { bet: 0.5, raise: 0.7, fold: 0.3, call: 0.2, all_in: 1.0 },
  call: { fold: 0.6, raise: 0.8, bet: 0.4, check: 0.2, all_in: 0.6 },
  bet: { check: 0.3, fold: 0.5, call: 0.3, raise: 0.4, all_in: 0.5 },
  raise: { call: 0.4, fold: 0.8, check: 0.5, bet: 0.3, all_in: 0.3 },
  all_in: { fold: 1.5, call: 0.5, check: 0.8, bet: 0.4, raise: 0.3 },
};

export interface EVEstimateInput {
  userAction: ActionType;
  userAmount?: number;
  gtoAction: ActionType;
  gtoAmount?: number;
  potSize: number;
  street: Street;
}

export interface EVEstimateResult {
  evLoss: number;
  deviationLevel: DeviationLevel;
  explanation: string;
}

/**
 * Determine deviation level based on user vs GTO action comparison.
 */
function classifyDeviation(
  userAction: ActionType,
  userAmount: number | undefined,
  gtoAction: ActionType,
  gtoAmount: number | undefined
): DeviationLevel {
  if (userAction === gtoAction) {
    // Same action type — check sizing difference
    if (userAmount === undefined || gtoAmount === undefined) {
      return 'conforming';
    }
    const sizingDiff = Math.abs(userAmount - gtoAmount);
    const threshold = gtoAmount * 0.25; // 25% tolerance
    if (sizingDiff <= threshold) {
      return 'conforming';
    }
    return 'minor';
  }

  // Map close action pairs to minor deviations
  const minorPairs: Array<[ActionType, ActionType]> = [
    ['bet', 'raise'],
    ['raise', 'bet'],
    ['call', 'check'],
    ['check', 'call'],
    ['bet', 'all_in'],
    ['raise', 'all_in'],
  ];

  for (const [a, b] of minorPairs) {
    if (userAction === a && gtoAction === b) {
      return 'minor';
    }
  }

  return 'major';
}

/**
 * Generate a human-readable explanation in Chinese for the deviation.
 */
function generateExplanation(
  userAction: ActionType,
  userAmount: number | undefined,
  gtoAction: ActionType,
  gtoAmount: number | undefined,
  deviationLevel: DeviationLevel,
  street: Street
): string {
  const actionNames: Record<ActionType, string> = {
    fold: 'fold',
    check: 'check',
    call: 'call',
    bet: 'bet',
    raise: 'raise',
    all_in: 'all-in',
  };

  const streetNames: Record<string, string> = {
    preflop: 'Preflop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
  };

  if (deviationLevel === 'conforming') {
    return `${streetNames[street] ?? street}: 行动符合 GTO 建议`;
  }

  const userDesc = userAmount != null
    ? `${actionNames[userAction]} ${userAmount.toFixed(1)}BB`
    : actionNames[userAction];

  const gtoDesc = gtoAmount != null
    ? `${actionNames[gtoAction]} ${gtoAmount.toFixed(1)}BB`
    : actionNames[gtoAction];

  if (deviationLevel === 'minor') {
    return `${streetNames[street] ?? street}: 你 ${userDesc}，GTO 建议 ${gtoDesc}（轻微偏差）`;
  }

  return `${streetNames[street] ?? street}: 你 ${userDesc}，GTO 建议 ${gtoDesc}`;
}

/**
 * Estimate the EV loss (in BB) for a player action that deviates from GTO.
 *
 * This uses a simplified model:
 * 1. Look up the base severity factor from the action matrix.
 * 2. Scale by street multiplier (later streets = bigger pots).
 * 3. Scale by pot size to get BB loss estimate.
 * 4. Adjust for sizing deviations when actions match.
 */
export function estimateEV(input: EVEstimateInput): EVEstimateResult {
  const { userAction, userAmount, gtoAction, gtoAmount, potSize, street } = input;

  const deviationLevel = classifyDeviation(userAction, userAmount, gtoAction, gtoAmount);

  if (deviationLevel === 'conforming') {
    return {
      evLoss: 0,
      deviationLevel: 'conforming',
      explanation: generateExplanation(userAction, userAmount, gtoAction, gtoAmount, 'conforming', street),
    };
  }

  const streetMult = STREET_MULTIPLIER[street] ?? 1.0;
  let evLoss: number;

  if (userAction === gtoAction && deviationLevel === 'minor') {
    // Sizing deviation — proportional to the sizing difference
    const diff = Math.abs((userAmount ?? 0) - (gtoAmount ?? 0));
    evLoss = diff * 0.3 * streetMult;
  } else {
    // Action deviation — use the severity matrix
    const baseSeverity = ACTION_SEVERITY[userAction]?.[gtoAction] ?? 1.0;
    const potFactor = Math.max(potSize, 1) * 0.1;
    evLoss = baseSeverity * potFactor * streetMult;
  }

  // Round to 1 decimal place
  evLoss = Math.round(evLoss * 10) / 10;

  // Ensure minimum EV loss for non-conforming plays
  if (evLoss < 0.1) {
    evLoss = 0.1;
  }

  const explanation = generateExplanation(
    userAction,
    userAmount,
    gtoAction,
    gtoAmount,
    deviationLevel,
    street
  );

  return { evLoss, deviationLevel, explanation };
}

/**
 * Compute the overall conformance label from per-decision deviation levels.
 */
export function computeOverallConformance(
  deviations: DeviationLevel[]
): 'conforming' | 'minor_deviation' | 'major_deviation' {
  if (deviations.length === 0) return 'conforming';

  const hasMajor = deviations.some((d) => d === 'major');
  if (hasMajor) return 'major_deviation';

  const hasMinor = deviations.some((d) => d === 'minor');
  if (hasMinor) return 'minor_deviation';

  return 'conforming';
}

/**
 * Compute a conformance percentage (0–100) from an array of deviation levels.
 * conforming = 1.0, minor = 0.5, major = 0.0
 */
export function computeConformancePercent(deviations: DeviationLevel[]): number {
  if (deviations.length === 0) return 100;

  const scores: Record<DeviationLevel, number> = {
    conforming: 1.0,
    minor: 0.5,
    major: 0.0,
  };

  const total = deviations.reduce((sum, d) => sum + scores[d], 0);
  return Math.round((total / deviations.length) * 100 * 10) / 10;
}
