/**
 * Dexie.js database definition for IndexedDB persistence.
 * Stores hand records, game sessions, and user settings.
 */

import Dexie, { type Table } from 'dexie';
import type { Card, HoleCards } from '../types/card';
import type { ActionsByStreet, HandResult, Position } from '../types/game';

// ─── Stored record types (DB-facing, mutable) ────────────────────────

/** Stored hand record */
export interface StoredHandRecord {
  id: string;
  gameId: string;
  handNumber: number;
  dealerPosition?: Position;
  players: StoredHandRecordPlayer[];
  communityCards: Card[];
  actionsByStreet: ActionsByStreet;
  result: HandResult;
  playedAt: string; // ISO date-time
}

export interface StoredHandRecordPlayer {
  playerId: string;
  name: string;
  position: Position;
  startingStack: number;
  endingStack: number;
  holeCards?: HoleCards;
  isUser?: boolean;
}

/** Stored game session */
export interface StoredGameSession {
  id: string;
  status: 'active' | 'ended';
  seatPosition: Position;
  handsPlayed: number;
  blindSize: { smallBlind: number; bigBlind: number };
  createdAt: string;
  endedAt?: string;
}

/** Stored user settings */
export interface StoredUserSettings {
  id: string; // always 'default'
  defaultSeatPosition?: Position;
  defaultStartingStack: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  botActionDelay: { min: number; max: number };
}

// ─── Database class ──────────────────────────────────────────────────

class GtoIdiotDB extends Dexie {
  hands!: Table<StoredHandRecord, string>;
  sessions!: Table<StoredGameSession, string>;
  settings!: Table<StoredUserSettings, string>;

  constructor() {
    super('gto-idiot');

    this.version(1).stores({
      hands: 'id, gameId, handNumber, playedAt, [gameId+handNumber]',
      sessions: 'id, status, createdAt',
      settings: 'id',
    });
  }
}

/** Singleton database instance */
export const db = new GtoIdiotDB();

/** Default user settings */
export const DEFAULT_SETTINGS: StoredUserSettings = {
  id: 'default',
  defaultSeatPosition: 'BTN',
  defaultStartingStack: 100,
  animationSpeed: 'normal',
  botActionDelay: { min: 500, max: 1500 },
};
