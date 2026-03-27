import type { HandHistory, HandListItem, GTORatingSummary } from '../types';
import type { HandRecord, HandListResult } from './types';
import { getDB } from './db';

function computeResultBB(record: HandRecord): number {
  const bigBlind = record.blinds.big || 2;
  const userPlayer = record.players.find((p) => p.isUser);
  if (!userPlayer) return 0;
  return (userPlayer.endingChips - userPlayer.startingChips) / bigBlind;
}

function computeGTORating(_record: HandRecord): GTORatingSummary {
  // GTO rating is computed at replay time by the replay-service.
  // For the hand list, return a zeroed summary as a placeholder —
  // the replay module will enrich this when the hand is analyzed.
  return {
    optimalCount: 0,
    acceptableCount: 0,
    errorCount: 0,
    totalDecisions: 0,
  };
}

function getUserHoleCards(record: HandRecord): [import('../types').Card, import('../types').Card] {
  const userPlayer = record.players.find((p) => p.isUser);
  if (userPlayer?.holeCards) return userPlayer.holeCards;
  // Fallback — should never happen in practice
  return [{ rank: '2', suit: 's' }, { rank: '7', suit: 'h' }];
}

function recordToHistory(record: HandRecord): HandHistory {
  return {
    handId: record.handId,
    handNumber: record.handNumber,
    sessionId: record.sessionId,
    playedAt: record.playedAt,
    blinds: record.blinds,
    players: record.players,
    communityCards: record.communityCards,
    streets: record.streets,
    result: record.result,
  };
}

function recordToListItem(record: HandRecord): HandListItem {
  return {
    handId: record.handId,
    handNumber: record.handNumber,
    sessionId: record.sessionId,
    playedAt: record.playedAt,
    holeCards: getUserHoleCards(record),
    resultBB: computeResultBB(record),
    gtoRating: computeGTORating(record),
  };
}

export async function saveHandHistory(record: HandRecord): Promise<void> {
  const db = await getDB();
  await db.put('hands', record);
}

export async function getHandHistory(handId: string): Promise<HandHistory | null> {
  const db = await getDB();
  const record: HandRecord | undefined = await db.get('hands', handId);
  if (!record) return null;
  return recordToHistory(record);
}

export async function listHands(
  options?: {
    sessionId?: string;
    page?: number;
    perPage?: number;
    filterErrorsOnly?: boolean;
    sortOrder?: string;
  },
): Promise<HandListResult> {
  const db = await getDB();
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;
  const sortOrder = options?.sortOrder ?? 'desc';

  let allRecords: HandRecord[];

  if (options?.sessionId) {
    allRecords = await db.getAllFromIndex('hands', 'bySessionId', options.sessionId);
  } else {
    allRecords = await db.getAll('hands');
  }

  // Sort by playedAt
  allRecords.sort((a, b) => {
    return sortOrder === 'desc'
      ? b.playedAt.localeCompare(a.playedAt)
      : a.playedAt.localeCompare(b.playedAt);
  });

  // Filter errors only — check if any user action in streets was rated as error
  // Since GTO rating enrichment happens in replay-service, filter by result for now:
  // hands where user lost chips (negative resultBB) as a heuristic when filterErrorsOnly
  if (options?.filterErrorsOnly) {
    allRecords = allRecords.filter((r) => {
      const resultBB = computeResultBB(r);
      // Filter for hands that had error decisions — for now use negative result as proxy
      return resultBB < 0;
    });
  }

  const totalItems = allRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (page - 1) * perPage;
  const paged = allRecords.slice(start, start + perPage);

  return {
    hands: paged.map(recordToListItem),
    pagination: { page, perPage, totalItems, totalPages },
  };
}
