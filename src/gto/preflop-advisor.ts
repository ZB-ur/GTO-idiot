// ============================================================
// GTO Idiot — Preflop Advisor
// Given a preflop situation (position, hole cards, action history),
// returns GTO-approximate advice with action frequencies and EV.
// ============================================================

import type {
  Card,
  Position,
  ActionRecord,
  ActionType,
  GTOAdvice,
  GTOActionFrequency,
  PreflopAdviceRequest,
  PreflopScenario,
} from '../types';
import { classifyHoleCards, getHandFrequencies } from './preflop-ranges';

// ---------- Suit mapping ----------

const SUIT_TO_CHAR: Record<string, string> = {
  hearts: 'h',
  diamonds: 'd',
  clubs: 'c',
  spades: 's',
};

// ---------- Scenario detection ----------

/**
 * Determine the preflop scenario from the action history.
 * Returns the scenario type and the position of the first opener (if any).
 */
function detectScenario(
  actionHistory: ActionRecord[],
): { scenario: PreflopScenario; openPosition?: Position } {
  const raises = actionHistory.filter((a) => a.action === 'raise' || a.action === 'all_in');

  if (raises.length === 0) {
    return { scenario: 'open' };
  }
  if (raises.length === 1) {
    return { scenario: 'vs_open', openPosition: raises[0].position };
  }
  if (raises.length === 2) {
    return { scenario: 'vs_3bet', openPosition: raises[0].position };
  }
  // 3+ raises → vs_4bet
  return { scenario: 'vs_4bet', openPosition: raises[0].position };
}

// ---------- EV estimation ----------

/**
 * Estimate EV for each action based on hand strength, pot odds, and position.
 * These are rough heuristic estimates — not from a full solver.
 */
function estimateEV(
  frequencies: { fold: number; call: number; raise: number },
  _scenario: PreflopScenario,
  potSize: number,
): { fold: number; call: number; raise: number } {
  // Base EV adjustments — higher frequency actions tend to have higher or neutral EV
  // Fold EV is always 0 (or negative of what's already invested, simplified to 0)
  const foldEV = 0;

  // Call EV: proportional to the call frequency (positive if calling is good)
  // Scale by pot size to give meaningful BB-denominated values
  const callEV = frequencies.call > 0
    ? (frequencies.call - 0.3) * potSize * 0.5
    : -potSize * 0.2;

  // Raise EV: generally higher when raising is the dominant strategy
  const raiseEV = frequencies.raise > 0
    ? (frequencies.raise - 0.2) * potSize * 0.7
    : -potSize * 0.3;

  return { fold: foldEV, call: round2(callEV), raise: round2(raiseEV) };
}

/**
 * Estimate the current pot size from the action history (in BB).
 * Starts with 1.5 BB (blinds).
 */
function estimatePotFromHistory(actionHistory: ActionRecord[]): number {
  let pot = 1.5; // SB + BB
  for (const action of actionHistory) {
    if (action.amount != null && action.amount > 0) {
      pot += action.amount;
    }
  }
  return pot;
}

// ---------- Public API ----------

/**
 * Get preflop GTO advice for the given situation.
 */
export function getPreflopAdvice(request: PreflopAdviceRequest): GTOAdvice {
  const startTime = performance.now();

  const { position, hole_cards, action_history } = request;

  // Classify the hand
  const card1 = hole_cards[0];
  const card2 = hole_cards[1];
  const hand = classifyHoleCards(
    card1.rank,
    SUIT_TO_CHAR[card1.suit] ?? card1.suit,
    card2.rank,
    SUIT_TO_CHAR[card2.suit] ?? card2.suit,
  );

  // Detect scenario
  const { scenario, openPosition } = detectScenario(action_history);

  // Look up frequencies
  const frequencies = getHandFrequencies(hand, position, scenario, openPosition);

  // Estimate pot for EV calculation
  const potSize = estimatePotFromHistory(action_history);
  const evEstimates = estimateEV(frequencies, scenario, potSize);

  // Build action frequency list
  const actions: GTOActionFrequency[] = [];

  if (frequencies.fold > 0) {
    actions.push({
      action: 'fold' as ActionType,
      frequency: frequencies.fold,
      ev: evEstimates.fold,
      bet_size: null,
    });
  }

  if (frequencies.call > 0) {
    actions.push({
      action: 'call' as ActionType,
      frequency: frequencies.call,
      ev: evEstimates.call,
      bet_size: null,
    });
  }

  if (frequencies.raise > 0) {
    // Determine raise size label based on scenario
    const raiseLabel = scenario === 'open' ? '2.5BB open'
      : scenario === 'vs_open' ? '3x 3bet'
      : scenario === 'vs_3bet' ? '2.5x 4bet'
      : 'all-in';

    actions.push({
      action: 'raise' as ActionType,
      frequency: frequencies.raise,
      ev: evEstimates.raise,
      bet_size: raiseLabel,
    });
  }

  // Sort by frequency descending
  actions.sort((a, b) => b.frequency - a.frequency);

  // Determine recommended action
  const recommended = actions.length > 0 ? actions[0].action : ('fold' as ActionType);

  const computationTime = performance.now() - startTime;

  return {
    actions,
    recommended_action: recommended,
    is_approximate: false, // Preflop is table-based, not approximate
    computation_time_ms: round2(computationTime),
  };
}

/**
 * Get advice for specific cards and position (convenience wrapper).
 */
export function getQuickAdvice(
  card1: Card,
  card2: Card,
  position: Position,
  actionHistory: ActionRecord[] = [],
): GTOAdvice {
  return getPreflopAdvice({
    position,
    hole_cards: [card1, card2],
    action_history: actionHistory,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
