// ============================================================
// Replay Engine — Reconstructs hand state at any decision point
// ============================================================

import type {
  Card,
  ActionLogEntry,
  HandPhase,
  Street,
  Pot,
} from '../types';
import type {
  HandHistory,
  HandReplayData,
  TimelineMarker,
} from '../types';
import type { DecisionPointAnalysis } from '../types';

// ============================================================
// Types
// ============================================================

export interface ReplayState {
  /** Current step index in the action sequence (0-based) */
  stepIndex: number;
  /** Total steps in the hand */
  totalSteps: number;
  /** Current street */
  street: Street;
  /** Current hand phase */
  phase: HandPhase;
  /** Community cards visible at this step */
  communityCards: Card[];
  /** Player states at this step */
  players: ReplayPlayer[];
  /** Pots at this step */
  pots: Pot[];
  /** The action that was just taken (null at step 0 / initial) */
  lastAction: ActionLogEntry | null;
  /** Seat of the player who just acted */
  actingSeat: number | null;
  /** Whether this is a user decision point */
  isUserDecisionPoint: boolean;
  /** Index into decisionPoints if this is a user decision, else -1 */
  decisionPointIndex: number;
  /** Dealer seat */
  dealerSeat: number;
}

export interface ReplayPlayer {
  seat: number;
  name: string;
  position: string;
  isHuman: boolean;
  stackBB: number;
  isActive: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards: Card[] | null;
  lastAction: string | null;
}

// ============================================================
// Replay Engine
// ============================================================

export class ReplayEngine {
  private readonly hand: HandHistory;
  private readonly decisionPoints: DecisionPointAnalysis[];
  private readonly userSeat: number;
  private _currentStep: number = 0;

  constructor(replayData: HandReplayData) {
    this.hand = replayData.handHistory;
    this.decisionPoints = replayData.decisionPoints;

    const humanSeat = this.hand.seats.find((s) => s.isHuman);
    this.userSeat = humanSeat?.seat ?? 0;
  }

  /** Total number of steps (initial state + each action) */
  get totalSteps(): number {
    return this.hand.actionSequence.length + 1; // +1 for initial state
  }

  get currentStep(): number {
    return this._currentStep;
  }

  /** Go to a specific step index */
  goToStep(stepIndex: number): ReplayState {
    this._currentStep = Math.max(0, Math.min(stepIndex, this.totalSteps - 1));
    return this.getState();
  }

  /** Advance to next step */
  next(): ReplayState {
    return this.goToStep(this._currentStep + 1);
  }

  /** Go back one step */
  previous(): ReplayState {
    return this.goToStep(this._currentStep - 1);
  }

  /** Go to the first step */
  goToStart(): ReplayState {
    return this.goToStep(0);
  }

  /** Go to the last step */
  goToEnd(): ReplayState {
    return this.goToStep(this.totalSteps - 1);
  }

  /** Go to the step for a specific street start */
  goToStreet(street: Street): ReplayState {
    if (street === 'preflop') return this.goToStep(0);

    const actions = this.hand.actionSequence;
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].street === street) {
        return this.goToStep(i + 1); // +1 because step 0 is initial
      }
    }
    return this.getState(); // Street not found, stay
  }

  /** Go to a specific decision point */
  goToDecisionPoint(dpIndex: number): ReplayState {
    if (dpIndex < 0 || dpIndex >= this.decisionPoints.length) {
      return this.getState();
    }
    const dp = this.decisionPoints[dpIndex];
    // Find the action step corresponding to this decision point
    const actions = this.hand.actionSequence;
    let userDecisionCount = 0;
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].seat === this.userSeat) {
        if (userDecisionCount === dp.index) {
          return this.goToStep(i + 1);
        }
        userDecisionCount++;
      }
    }
    return this.getState();
  }

  /** Get the current replay state */
  getState(): ReplayState {
    const step = this._currentStep;
    const actions = this.hand.actionSequence;
    const actionsUpToStep = actions.slice(0, step);

    // Determine street and phase
    const street = this.computeStreet(actionsUpToStep);
    const phase = this.computePhase(step, street);

    // Compute community cards visible at this step
    const communityCards = this.computeCommunityCards(street);

    // Compute player states by replaying actions
    const players = this.computePlayerStates(actionsUpToStep);

    // Compute pots
    const pots = this.computePots(actionsUpToStep);

    // Last action
    const lastAction = step > 0 ? actions[step - 1] : null;
    const actingSeat = lastAction?.seat ?? null;

    // Check if this is a user decision point
    const { isUserDecision, dpIndex } = this.checkUserDecision(step);

    return {
      stepIndex: step,
      totalSteps: this.totalSteps,
      street,
      phase,
      communityCards,
      players,
      pots,
      lastAction,
      actingSeat,
      isUserDecisionPoint: isUserDecision,
      decisionPointIndex: dpIndex,
      dealerSeat: this.hand.dealerSeat,
    };
  }

  /** Get the decision point analysis for the current step (if any) */
  getDecisionAnalysis(): DecisionPointAnalysis | null {
    const { isUserDecision, dpIndex } = this.checkUserDecision(this._currentStep);
    if (!isUserDecision || dpIndex < 0) return null;
    return this.decisionPoints[dpIndex] ?? null;
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private computeStreet(actions: ActionLogEntry[]): Street {
    if (actions.length === 0) return 'preflop';
    return actions[actions.length - 1].street;
  }

  private computePhase(step: number, street: Street): HandPhase {
    if (step >= this.totalSteps - 1) {
      return this.hand.settlement.wonWithoutShowdown ? 'settled' : 'showdown';
    }
    return street;
  }

  private computeCommunityCards(street: Street): Card[] {
    const all = this.hand.communityCards;
    switch (street) {
      case 'preflop': return [];
      case 'flop': return all.slice(0, 3);
      case 'turn': return all.slice(0, 4);
      case 'river': return all.slice(0, 5);
      default: return all;
    }
  }

  private computePlayerStates(actions: ActionLogEntry[]): ReplayPlayer[] {
    return this.hand.seats.map((seat) => {
      const playerActions = actions.filter((a) => a.seat === seat.seat);
      const hasFolded = playerActions.some((a) => a.action === 'fold');
      const isAllIn = playerActions.some((a) => a.action === 'all_in');

      // Compute stack changes
      let totalInvested = 0;
      for (const a of playerActions) {
        if (a.amount != null && a.amount > 0) {
          totalInvested += a.amount;
        }
      }

      // Current bet in current street
      const currentStreet = actions.length > 0 ? actions[actions.length - 1].street : 'preflop';
      const streetActions = playerActions.filter((a) => a.street === currentStreet);
      let currentBet = 0;
      for (const a of streetActions) {
        if (a.amount != null && a.amount > 0) {
          currentBet = a.amount; // For raise, the amount is the total bet
        }
      }

      const lastAction = playerActions.length > 0
        ? playerActions[playerActions.length - 1].action
        : null;

      // Decide hole card visibility
      const showCards = seat.isHuman || this.isAtShowdown(actions);

      return {
        seat: seat.seat,
        name: seat.name,
        position: seat.position,
        isHuman: seat.isHuman,
        stackBB: seat.startingStackBB - totalInvested,
        isActive: !hasFolded,
        isAllIn,
        currentBet,
        holeCards: showCards ? seat.holeCards : null,
        lastAction,
      };
    });
  }

  private isAtShowdown(actions: ActionLogEntry[]): boolean {
    // At showdown if all actions are played
    return actions.length >= this.hand.actionSequence.length &&
      !this.hand.settlement.wonWithoutShowdown;
  }

  private computePots(actions: ActionLogEntry[]): Pot[] {
    if (actions.length === 0) {
      // Blinds posted
      const bb = this.hand.blinds.bigBlind;
      const sb = this.hand.blinds.smallBlind;
      return [{
        amount: sb + bb,
        eligibleSeats: this.hand.seats.map((s) => s.seat),
      }];
    }

    const lastAction = actions[actions.length - 1];
    return [{
      amount: lastAction.potAfter,
      eligibleSeats: this.hand.seats
        .filter((s) => !actions.some(
          (a) => a.seat === s.seat && a.action === 'fold',
        ))
        .map((s) => s.seat),
    }];
  }

  private checkUserDecision(step: number): { isUserDecision: boolean; dpIndex: number } {
    if (step === 0) return { isUserDecision: false, dpIndex: -1 };

    const action = this.hand.actionSequence[step - 1];
    if (!action || action.seat !== this.userSeat) {
      return { isUserDecision: false, dpIndex: -1 };
    }

    // Count user decisions up to this step
    let userDecisions = 0;
    for (let i = 0; i < step; i++) {
      if (this.hand.actionSequence[i].seat === this.userSeat) {
        userDecisions++;
      }
    }

    // Match to decision point by index
    const dpIndex = this.decisionPoints.findIndex(
      (dp) => dp.index === userDecisions - 1,
    );

    return {
      isUserDecision: true,
      dpIndex: dpIndex >= 0 ? dpIndex : -1,
    };
  }
}

// ============================================================
// Build replay data from hand history + GTO analysis
// ============================================================

export function buildReplayData(
  handHistory: HandHistory,
  decisionPoints: DecisionPointAnalysis[],
): HandReplayData {
  const totalEvLossBB = decisionPoints.reduce(
    (sum, dp) => sum + Math.min(dp.evDiffBB, 0),
    0,
  );

  const timelineMarkers = buildTimelineMarkers(handHistory, decisionPoints);

  return {
    handHistory,
    decisionPoints,
    totalEvLossBB,
    timelineMarkers,
  };
}

function buildTimelineMarkers(
  hand: HandHistory,
  decisionPoints: DecisionPointAnalysis[],
): TimelineMarker[] {
  const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
  const markers: TimelineMarker[] = [];

  const streetsInHand = new Set(hand.actionSequence.map((a) => a.street));

  for (const street of streetOrder) {
    if (!streetsInHand.has(street) && street !== 'preflop') continue;

    const dpIndices = decisionPoints
      .map((dp, i) => (dp.street === street ? i : -1))
      .filter((i) => i >= 0);

    const label = street.charAt(0).toUpperCase() + street.slice(1);

    markers.push({
      label,
      street,
      decisionPointIndices: dpIndices,
    });
  }

  return markers;
}
