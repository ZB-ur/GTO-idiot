import { nanoid } from 'nanoid';
import type { SessionDetail, SessionSummary } from '../types';
import type { SessionRecord, SessionListResult } from './types';
import { getDB } from './db';
import { DEFAULT_BLINDS, DEFAULT_BUY_IN, POSITIONS, BOT_STYLES, SEAT_COUNT } from '../constants';

function generatePlayers(): SessionDetail['players'] {
  const botNames = ['鲨鱼哥', '疯狗', '铁壁', '小鱼', '平衡侠'];
  const styles = [...BOT_STYLES];
  const players: SessionDetail['players'] = [];

  // Seat 0 is always the user
  players.push({
    playerId: `player_user`,
    nickname: '用户',
    seatIndex: 0,
    isUser: true,
    chipCount: DEFAULT_BUY_IN,
  });

  for (let i = 1; i < SEAT_COUNT; i++) {
    players.push({
      playerId: `player_bot_${i}`,
      nickname: botNames[i - 1],
      seatIndex: i,
      isUser: false,
      botStyle: styles[i - 1],
      chipCount: DEFAULT_BUY_IN,
    });
  }

  return players;
}

function recordToDetail(record: SessionRecord): SessionDetail {
  return {
    sessionId: record.sessionId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    handsPlayed: record.handsPlayed,
    netProfitBB: record.netProfitBB,
    status: record.status,
    blinds: record.blinds,
    buyIn: record.buyIn,
    players: record.players,
    currentHandId: record.currentHandId,
  };
}

function recordToSummary(record: SessionRecord): SessionSummary {
  return {
    sessionId: record.sessionId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    handsPlayed: record.handsPlayed,
    netProfitBB: record.netProfitBB,
    status: record.status,
  };
}

export async function createSession(): Promise<SessionDetail> {
  const db = await getDB();
  const now = new Date().toISOString();

  const record: SessionRecord = {
    sessionId: `sess_${nanoid(10)}`,
    createdAt: now,
    updatedAt: now,
    handsPlayed: 0,
    netProfitBB: 0,
    status: 'active',
    blinds: { ...DEFAULT_BLINDS },
    buyIn: DEFAULT_BUY_IN,
    players: generatePlayers(),
    currentHandId: null,
    dealerSeatIndex: 0,
  };

  await db.put('sessions', record);
  return recordToDetail(record);
}

export async function getSession(sessionId: string): Promise<SessionDetail | null> {
  const db = await getDB();
  const record: SessionRecord | undefined = await db.get('sessions', sessionId);
  if (!record) return null;
  return recordToDetail(record);
}

export async function listSessions(
  page: number = 1,
  perPage: number = 20,
  sortBy: string = 'updatedAt',
  sortOrder: string = 'desc',
): Promise<SessionListResult> {
  const db = await getDB();
  const allRecords: SessionRecord[] = await db.getAll('sessions');

  // Sort
  const sortKey = sortBy === 'created_at' ? 'createdAt'
    : sortBy === 'hands_played' ? 'handsPlayed'
    : 'updatedAt';

  allRecords.sort((a, b) => {
    const aVal = a[sortKey as keyof SessionRecord];
    const bVal = b[sortKey as keyof SessionRecord];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
  });

  const totalItems = allRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (page - 1) * perPage;
  const paged = allRecords.slice(start, start + perPage);

  return {
    sessions: paged.map(recordToSummary),
    pagination: { page, perPage, totalItems, totalPages },
  };
}

export async function endSession(sessionId: string): Promise<SessionSummary> {
  const db = await getDB();
  const record: SessionRecord | undefined = await db.get('sessions', sessionId);
  if (!record) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  record.status = 'completed';
  record.updatedAt = new Date().toISOString();
  record.currentHandId = null;
  await db.put('sessions', record);

  return recordToSummary(record);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDB();
  await db.delete('sessions', sessionId);
}
