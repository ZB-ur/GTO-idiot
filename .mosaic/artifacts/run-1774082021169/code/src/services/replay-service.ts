/**
 * Replay service — constructs step-by-step replay frames from a completed hand record.
 * Each frame represents one atomic state change for visual replay.
 */

import type { Card } from '../types/card';
import type {
  ActionEntry,
  HandRecord,
  Position,
  Street,
} from '../types/game';
import { getHandRecord } from './hand-recorder';

/** Frame type describing what happened */
export type ReplayFrameType =
  | 'deal_hole_cards'
  | 'post_blinds'
  | 'player_action'
  | 'deal_flop'
  | 'deal_turn'
  | 'deal_river'
  | 'showdown'
  | 'award_pot';

/** A single replay frame */
export interface ReplayFrame {
  readonly index: number;
  readonly type: ReplayFrameType;
  readonly street: Street;
  readonly action?: ActionEntry;
  readonly cardsRevealed?: readonly Card[];
  readonly tableState: {
    readonly pot: number;
    readonly communityCards: readonly Card[];
    readonly players: readonly ReplayPlayerState[];
  };
  readonly isUserDecisionPoint: boolean;
}

/** Simplified player state for replay */
export interface ReplayPlayerState {
  readonly playerId: string;
  readonly name: string;
  readonly position: Position;
  readonly stack: number;
  readonly currentBet: number;
  readonly isFolded: boolean;
  readonly isAllIn: boolean;
  readonly isActive: boolean;
  readonly lastAction?: string;
  readonly holeCards?: { card1: Card; card2: Card };
}

/** Complete replay data */
export interface ReplayData {
  readonly handId: string;
  readonly totalFrames: number;
  readonly frames: readonly ReplayFrame[];
}

/**
 * Generate replay data for a completed hand.
 */
export async function getReplayData(handId: string): Promise<ReplayData | undefined> {
  const record = await getHandRecord(handId);
  if (!record) return undefined;

  const frames = buildFrames(record);
  return {
    handId: record.id,
    totalFrames: frames.length,
    frames,
  };
}

/**
 * Build replay frames from a hand record.
 */
function buildFrames(record: HandRecord): ReplayFrame[] {
  const frames: ReplayFrame[] = [];
  let frameIndex = 0;

  // Initialize player states from record
  const playerStates: Map<string, ReplayPlayerState> = new Map();
  for (const p of record.players) {
    playerStates.set(p.playerId, {
      playerId: p.playerId,
      name: p.name,
      position: p.position,
      stack: p.startingStack,
      currentBet: 0,
      isFolded: false,
      isAllIn: false,
      isActive: true,
    });
  }

  let pot = 0;
  const communityCards: Card[] = [];

  // Frame 1: Deal hole cards
  frames.push({
    index: frameIndex++,
    type: 'deal_hole_cards',
    street: 'preflop',
    tableState: snapshotTable(pot, communityCards, playerStates),
    isUserDecisionPoint: false,
  });

  // Frame 2: Post blinds (first two preflop actions are blinds)
  const preflopActions = record.actionsByStreet.preflop ?? [];
  const blindActions = preflopActions.slice(0, 2);
  for (const blind of blindActions) {
    applyActionToState(playerStates, blind);
    pot += blind.amount ?? 0;
  }

  frames.push({
    index: frameIndex++,
    type: 'post_blinds',
    street: 'preflop',
    tableState: snapshotTable(pot, communityCards, playerStates),
    isUserDecisionPoint: false,
  });

  // Preflop actions (after blinds)
  const preflopVoluntary = preflopActions.slice(2);
  for (const action of preflopVoluntary) {
    const isUser = record.players.find(p => p.isUser)?.playerId === action.playerId;
    applyActionToState(playerStates, action);
    pot = action.potAfterAction ?? pot;

    frames.push({
      index: frameIndex++,
      type: 'player_action',
      street: 'preflop',
      action,
      tableState: snapshotTable(pot, communityCards, playerStates),
      isUserDecisionPoint: isUser,
    });
  }

  // Flop
  const flopActions = record.actionsByStreet.flop ?? [];
  if (record.communityCards.length >= 3) {
    const flopCards = record.communityCards.slice(0, 3);
    communityCards.push(...flopCards);
    resetStreetBets(playerStates);

    frames.push({
      index: frameIndex++,
      type: 'deal_flop',
      street: 'flop',
      cardsRevealed: flopCards,
      tableState: snapshotTable(pot, communityCards, playerStates),
      isUserDecisionPoint: false,
    });

    for (const action of flopActions) {
      const isUser = record.players.find(p => p.isUser)?.playerId === action.playerId;
      applyActionToState(playerStates, action);
      pot = action.potAfterAction ?? pot;

      frames.push({
        index: frameIndex++,
        type: 'player_action',
        street: 'flop',
        action,
        tableState: snapshotTable(pot, communityCards, playerStates),
        isUserDecisionPoint: isUser,
      });
    }
  }

  // Turn
  const turnActions = record.actionsByStreet.turn ?? [];
  if (record.communityCards.length >= 4) {
    const turnCard = record.communityCards[3]!;
    communityCards.push(turnCard);
    resetStreetBets(playerStates);

    frames.push({
      index: frameIndex++,
      type: 'deal_turn',
      street: 'turn',
      cardsRevealed: [turnCard],
      tableState: snapshotTable(pot, communityCards, playerStates),
      isUserDecisionPoint: false,
    });

    for (const action of turnActions) {
      const isUser = record.players.find(p => p.isUser)?.playerId === action.playerId;
      applyActionToState(playerStates, action);
      pot = action.potAfterAction ?? pot;

      frames.push({
        index: frameIndex++,
        type: 'player_action',
        street: 'turn',
        action,
        tableState: snapshotTable(pot, communityCards, playerStates),
        isUserDecisionPoint: isUser,
      });
    }
  }

  // River
  const riverActions = record.actionsByStreet.river ?? [];
  if (record.communityCards.length >= 5) {
    const riverCard = record.communityCards[4]!;
    communityCards.push(riverCard);
    resetStreetBets(playerStates);

    frames.push({
      index: frameIndex++,
      type: 'deal_river',
      street: 'river',
      cardsRevealed: [riverCard],
      tableState: snapshotTable(pot, communityCards, playerStates),
      isUserDecisionPoint: false,
    });

    for (const action of riverActions) {
      const isUser = record.players.find(p => p.isUser)?.playerId === action.playerId;
      applyActionToState(playerStates, action);
      pot = action.potAfterAction ?? pot;

      frames.push({
        index: frameIndex++,
        type: 'player_action',
        street: 'river',
        action,
        tableState: snapshotTable(pot, communityCards, playerStates),
        isUserDecisionPoint: isUser,
      });
    }
  }

  // Showdown (if went to showdown)
  if (record.result.wentToShowdown) {
    // Reveal hole cards
    for (const p of record.players) {
      if (p.holeCards && !playerStates.get(p.playerId)?.isFolded) {
        const state = playerStates.get(p.playerId);
        if (state) {
          playerStates.set(p.playerId, { ...state, holeCards: p.holeCards });
        }
      }
    }

    frames.push({
      index: frameIndex++,
      type: 'showdown',
      street: 'river',
      tableState: snapshotTable(pot, communityCards, playerStates),
      isUserDecisionPoint: false,
    });
  }

  // Award pot
  for (const winner of record.result.winners) {
    const state = playerStates.get(winner.playerId);
    if (state) {
      playerStates.set(winner.playerId, {
        ...state,
        stack: state.stack + winner.amount,
      });
    }
  }

  frames.push({
    index: frameIndex++,
    type: 'award_pot',
    street: 'river',
    tableState: snapshotTable(0, communityCards, playerStates),
    isUserDecisionPoint: false,
  });

  return frames;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function applyActionToState(
  states: Map<string, ReplayPlayerState>,
  action: ActionEntry,
): void {
  const state = states.get(action.playerId);
  if (!state) return;

  const amount = action.amount ?? 0;

  switch (action.action) {
    case 'fold':
      states.set(action.playerId, { ...state, isFolded: true, isActive: false, lastAction: 'fold' });
      break;
    case 'check':
      states.set(action.playerId, { ...state, lastAction: 'check' });
      break;
    case 'call':
      states.set(action.playerId, {
        ...state,
        stack: Math.max(0, state.stack - amount),
        currentBet: state.currentBet + amount,
        lastAction: 'call',
      });
      break;
    case 'raise':
      states.set(action.playerId, {
        ...state,
        stack: Math.max(0, state.stack - (amount - state.currentBet)),
        currentBet: amount,
        lastAction: 'raise',
      });
      break;
    case 'all_in':
      states.set(action.playerId, {
        ...state,
        stack: 0,
        currentBet: state.currentBet + state.stack,
        isAllIn: true,
        lastAction: 'all_in',
      });
      break;
  }
}

function resetStreetBets(states: Map<string, ReplayPlayerState>): void {
  for (const [id, state] of states) {
    states.set(id, { ...state, currentBet: 0, lastAction: undefined });
  }
}

function snapshotTable(
  pot: number,
  communityCards: readonly Card[],
  playerStates: Map<string, ReplayPlayerState>,
): ReplayFrame['tableState'] {
  return {
    pot,
    communityCards: [...communityCards],
    players: Array.from(playerStates.values()),
  };
}
