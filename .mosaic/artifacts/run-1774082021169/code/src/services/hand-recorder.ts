/**
 * Hand recorder — converts completed HandState into a StoredHandRecord
 * and persists it to IndexedDB.
 */

import type {
  ActionEntry,
  ActionsByStreet,
  HandRecord,
  HandRecordPlayer,
  HandResult,
  HandState,
  Street,
} from '../types/game';
import { db, type StoredHandRecord } from './db';
import { now } from '../engine/utils';

/**
 * Record a completed hand to the database.
 * Converts the in-memory HandState into a full HandRecord.
 */
export async function recordHand(state: HandState, userId: string): Promise<HandRecord> {
  if (state.phase !== 'complete') {
    throw new Error('Cannot record an incomplete hand');
  }

  const record = buildHandRecord(state, userId);

  // Store in DB
  const stored: StoredHandRecord = {
    id: record.id,
    gameId: record.gameId,
    handNumber: record.handNumber,
    dealerPosition: record.dealerPosition,
    players: [...record.players],
    communityCards: [...record.communityCards],
    actionsByStreet: record.actionsByStreet,
    result: record.result,
    playedAt: record.playedAt,
  };

  await db.hands.put(stored);
  return record;
}

/**
 * Build a HandRecord from a completed HandState.
 */
function buildHandRecord(state: HandState, userId: string): HandRecord {
  // Organize actions by street
  const actionsByStreet = groupActionsByStreet(state.actionHistory);

  // Build player records
  const players: HandRecordPlayer[] = state.players.map(p => {
    // Compute starting stack by reversing the P&L
    const winAmount = state.winners?.find(w => w.playerId === p.playerId)?.amount ?? 0;
    const totalBet = computeTotalBet(state.actionHistory, p.playerId);
    const startingStack = p.stack - winAmount + totalBet;

    return {
      playerId: p.playerId,
      name: p.name,
      position: p.position,
      startingStack: Math.round(startingStack * 100) / 100,
      endingStack: p.stack,
      holeCards: p.holeCards,
      isUser: p.playerId === userId,
    };
  });

  // Calculate user profit
  const userPlayer = players.find(p => p.isUser);
  const userProfit = userPlayer
    ? Math.round((userPlayer.endingStack - userPlayer.startingStack) * 100) / 100
    : 0;

  // Determine if hand went to showdown
  const wentToShowdown = state.communityCards.length >= 3 &&
    state.players.filter(p => !p.isFolded).length > 1;

  const result: HandResult = {
    winners: state.winners ?? [],
    finalPot: state.pot,
    userProfit,
    wentToShowdown,
  };

  return {
    id: state.id,
    gameId: state.gameId,
    handNumber: state.handNumber ?? 0,
    dealerPosition: state.dealerPosition,
    players,
    communityCards: [...state.communityCards],
    actionsByStreet,
    result,
    playedAt: now(),
  };
}

/**
 * Group action history entries by street.
 */
function groupActionsByStreet(actions: readonly ActionEntry[]): ActionsByStreet {
  const result: ActionsByStreet = {};
  const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];

  for (const street of streets) {
    const streetActions = actions.filter(a => a.street === street);
    if (streetActions.length > 0) {
      (result as Record<string, readonly ActionEntry[]>)[street] = streetActions;
    }
  }

  return result;
}

/**
 * Compute total bet amount for a player from action history.
 */
function computeTotalBet(actions: readonly ActionEntry[], playerId: string): number {
  let total = 0;
  for (const action of actions) {
    if (action.playerId !== playerId) continue;
    if (action.amount && (action.action === 'call' || action.action === 'raise' || action.action === 'all_in')) {
      total += action.amount;
    }
  }
  return Math.round(total * 100) / 100;
}

/**
 * Get a hand record by ID from the database.
 */
export async function getHandRecord(handId: string): Promise<HandRecord | undefined> {
  const stored = await db.hands.get(handId);
  if (!stored) return undefined;

  return {
    id: stored.id,
    gameId: stored.gameId,
    handNumber: stored.handNumber,
    dealerPosition: stored.dealerPosition,
    players: stored.players,
    communityCards: stored.communityCards,
    actionsByStreet: stored.actionsByStreet,
    result: stored.result,
    playedAt: stored.playedAt,
  };
}
