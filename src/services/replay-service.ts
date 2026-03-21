// ============================================================
// GTO Idiot — Replay Service
// Transforms a HandHistory into structured replay steps that
// the UI can step through one-by-one.
// ============================================================

import type {
  HandHistory,
  HandHistoryAction,
  ReplayData,
  ReplayStep,
  ReplayTableState,
  PlayerState,
  Card,
  Street,
  Deviation,
  DeviationAnalysis,
} from '../types';
import { getHand } from '../storage/hand-repository';

// ============================================================
// Public API
// ============================================================

/**
 * Build replay data for a given hand.
 * Returns an array of ReplaySteps with full table snapshots
 * at each moment so the replay viewer can scrub freely.
 */
export async function getReplayData(handId: string): Promise<ReplayData> {
  const hand = await getHand(handId);
  if (!hand) {
    throw new HandNotFoundError(handId);
  }

  return buildReplayData(hand);
}

/**
 * Build replay data from an in-memory HandHistory (no DB lookup).
 */
export function buildReplayData(
  hand: HandHistory,
  deviations?: DeviationAnalysis,
): ReplayData {
  const steps: ReplayStep[] = [];
  const deviationMap = buildDeviationMap(deviations);

  let stepIndex = 0;
  const streetIndices: ReplayData['street_indices'] = {
    preflop: 0,
    flop: null,
    turn: null,
    river: null,
  };

  // Initial player states (before any action)
  let currentPlayers = hand.players.map((p) => toPlayerState(p, hand));
  let currentPot = 0;
  let currentCommunityCards: Card[] = [];

  // Step 0: Deal hole cards
  steps.push({
    index: stepIndex++,
    type: 'deal_hole_cards',
    street: 'preflop',
    table_state: snapshot(currentPot, currentCommunityCards, currentPlayers),
    action: null,
    is_hero_decision: false,
    deviation: null,
  });

  // Step 1: Post blinds
  const sbAction = hand.actions[0];
  const bbAction = hand.actions.length > 1 ? hand.actions[1] : null;

  if (sbAction) {
    currentPot = sbAction.pot_after;
    currentPlayers = applyBlindToPlayers(currentPlayers, sbAction);
  }
  if (bbAction && bbAction.sequence <= 1) {
    currentPot = bbAction.pot_after;
    currentPlayers = applyBlindToPlayers(currentPlayers, bbAction);
  }

  steps.push({
    index: stepIndex++,
    type: 'post_blinds',
    street: 'preflop',
    table_state: snapshot(currentPot, currentCommunityCards, currentPlayers),
    action: null,
    is_hero_decision: false,
    deviation: null,
  });

  // Track which street we've seen community cards for
  let lastStreet: Street = 'preflop';

  // Process each action
  for (const action of hand.actions) {
    // If street changed, insert a deal_community step
    if (action.street !== lastStreet) {
      const newStreet: Street = action.street;

      // Update community cards based on the new street
      currentCommunityCards = getCommunityCardsForStreet(hand.community_cards, newStreet);

      // Record street index
      if (newStreet === 'flop' || newStreet === 'turn' || newStreet === 'river') {
        streetIndices[newStreet] = stepIndex;
      }

      steps.push({
        index: stepIndex++,
        type: 'deal_community',
        street: newStreet,
        table_state: snapshot(currentPot, currentCommunityCards, currentPlayers),
        action: null,
        is_hero_decision: false,
        deviation: null,
      });

      lastStreet = newStreet;
    }

    // Apply the action to current state
    currentPot = action.pot_after;
    currentPlayers = applyActionToPlayers(currentPlayers, action);

    const isHeroDecision = action.is_hero;
    const deviation = isHeroDecision
      ? deviationMap.get(action.sequence) ?? null
      : null;

    steps.push({
      index: stepIndex++,
      type: 'player_action',
      street: action.street,
      table_state: snapshot(currentPot, currentCommunityCards, currentPlayers),
      action,
      is_hero_decision: isHeroDecision,
      deviation,
    });
  }

  // Final step: showdown (if applicable)
  if (hand.result.went_to_showdown) {
    // Reveal all cards at showdown
    currentCommunityCards = hand.community_cards;
    const showdownPlayers = currentPlayers.map((p) => {
      const historyPlayer = hand.players.find((hp) => hp.seat === p.seat);
      return {
        ...p,
        hole_cards: historyPlayer?.hole_cards ?? p.hole_cards,
      };
    });

    steps.push({
      index: stepIndex++,
      type: 'showdown',
      street: lastStreet,
      table_state: snapshot(currentPot, currentCommunityCards, showdownPlayers),
      action: null,
      is_hero_decision: false,
      deviation: null,
    });
  }

  return {
    hand_id: hand.id,
    steps,
    total_steps: steps.length,
    street_indices: streetIndices,
  };
}

// ============================================================
// Internal helpers
// ============================================================

function snapshot(
  pot: number,
  communityCards: Card[],
  players: PlayerState[],
): ReplayTableState {
  return {
    pot,
    community_cards: [...communityCards],
    players: players.map((p) => ({ ...p })),
  };
}

function toPlayerState(
  historyPlayer: HandHistory['players'][number],
  _hand: HandHistory,
): PlayerState {
  const isHero = !historyPlayer.is_bot;
  return {
    seat: historyPlayer.seat,
    name: historyPlayer.name,
    position: historyPlayer.position,
    stack: historyPlayer.starting_stack,
    hole_cards: isHero ? historyPlayer.hole_cards : null,
    is_active: true,
    is_all_in: false,
    is_bot: historyPlayer.is_bot,
    current_bet: 0,
    total_invested: 0,
    last_action: null,
  };
}

function applyBlindToPlayers(
  players: PlayerState[],
  action: HandHistoryAction,
): PlayerState[] {
  return players.map((p) => {
    if (p.seat === action.seat && action.amount != null) {
      return {
        ...p,
        stack: p.stack - action.amount,
        current_bet: p.current_bet + action.amount,
        total_invested: p.total_invested + action.amount,
        last_action: `blind ${action.amount}`,
      };
    }
    return p;
  });
}

function applyActionToPlayers(
  players: PlayerState[],
  action: HandHistoryAction,
): PlayerState[] {
  return players.map((p) => {
    if (p.seat !== action.seat) return p;

    const updated = { ...p };

    switch (action.action) {
      case 'fold':
        updated.is_active = false;
        updated.last_action = 'fold';
        break;
      case 'check':
        updated.last_action = 'check';
        break;
      case 'call':
        if (action.amount != null) {
          updated.stack -= action.amount;
          updated.current_bet += action.amount;
          updated.total_invested += action.amount;
          updated.last_action = `call ${action.amount}`;
          if (updated.stack <= 0) updated.is_all_in = true;
        }
        break;
      case 'raise':
        if (action.amount != null) {
          const raiseAmount = action.amount - updated.current_bet;
          updated.stack -= raiseAmount;
          updated.current_bet = action.amount;
          updated.total_invested += raiseAmount;
          updated.last_action = `raise to ${action.amount}`;
          if (updated.stack <= 0) updated.is_all_in = true;
        }
        break;
      case 'all_in':
        if (action.amount != null) {
          updated.stack = 0;
          updated.current_bet += action.amount;
          updated.total_invested += action.amount;
          updated.is_all_in = true;
          updated.last_action = `all-in ${updated.current_bet}`;
        }
        break;
    }

    return updated;
  });
}

function getCommunityCardsForStreet(allCommunityCards: Card[], street: Street): Card[] {
  switch (street) {
    case 'preflop':
      return [];
    case 'flop':
      return allCommunityCards.slice(0, 3);
    case 'turn':
      return allCommunityCards.slice(0, 4);
    case 'river':
      return allCommunityCards.slice(0, 5);
  }
}

function buildDeviationMap(
  analysis?: DeviationAnalysis,
): Map<number, Deviation> {
  const map = new Map<number, Deviation>();
  if (!analysis) return map;

  for (const dev of analysis.deviations) {
    map.set(dev.decision_point, dev);
  }
  return map;
}

// ============================================================
// Error classes
// ============================================================

export class HandNotFoundError extends Error {
  constructor(handId: string) {
    super(`Hand not found: ${handId}`);
    this.name = 'HandNotFoundError';
  }
}
