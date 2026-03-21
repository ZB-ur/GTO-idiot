// ============================================================
// GTO Idiot — IndexedDB Database (Dexie.js)
// Tables: sessions, hands
// ============================================================

import Dexie, { type EntityTable } from 'dexie';
import type {
  Session,
  HandHistory,
  HandSummary,
  SessionStatus,
  BlindsConfig,
  BotConfig,
} from '../types';

// ---------- Stored record shapes ----------
// These extend the API types with IndexedDB-friendly flat indices.

export interface SessionRecord {
  id: string;
  status: SessionStatus;
  config: {
    bots: BotConfig[];
    blinds: BlindsConfig;
    starting_stack: number;
  };
  hand_count: number;
  current_hand_id: string | null;
  player_stack: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface HandRecord extends HandHistory {
  // HandHistory already has: id, session_id, hand_number, date, ...
  // Extra flattened fields for indexing:
  position: string;       // hero_position duplicated for index
  result_bb: number;      // hero_result_bb duplicated for index
  street_reached: string; // last street reached
  has_deviation: boolean;
  max_deviation_severity: string | null;
  hero_hand_json: string | null; // serialised hero hole cards for listing
}

// ---------- Database class ----------

class GtoIdiotDB extends Dexie {
  sessions!: EntityTable<SessionRecord, 'id'>;
  hands!: EntityTable<HandRecord, 'id'>;

  constructor() {
    super('gto-idiot');

    this.version(1).stores({
      // Primary key + indexed fields
      sessions: 'id, status, created_at, updated_at',
      hands: 'id, session_id, hand_number, date, position, result_bb, has_deviation, [session_id+hand_number]',
    });
  }
}

/** Singleton database instance */
export const db = new GtoIdiotDB();

// ---------- Helpers ----------

/** Convert a Session API type to a storable record */
export function toSessionRecord(session: Session): SessionRecord {
  return {
    id: session.id,
    status: session.status,
    config: session.config,
    hand_count: session.hand_count,
    current_hand_id: session.current_hand_id,
    player_stack: session.player_stack,
    created_at: session.created_at,
    updated_at: session.updated_at,
  };
}

/** Convert a stored record back to the Session API type */
export function fromSessionRecord(record: SessionRecord): Session {
  return {
    id: record.id,
    status: record.status,
    config: record.config,
    hand_count: record.hand_count,
    current_hand_id: record.current_hand_id,
    player_stack: record.player_stack,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

/** Derive the flat index fields from a HandHistory and persist as HandRecord */
export function toHandRecord(hand: HandHistory): HandRecord {
  const lastAction = hand.actions[hand.actions.length - 1];
  const streetReached = lastAction?.street ?? 'preflop';

  // Check for deviations (will be populated later by deviation analysis)
  const hasDeviation = false;
  const maxDeviationSeverity: string | null = null;

  const heroPlayer = hand.players.find((p) => !p.is_bot);
  const heroHand = heroPlayer?.hole_cards ?? null;

  return {
    ...hand,
    position: hand.hero_position,
    result_bb: hand.hero_result_bb,
    street_reached: streetReached,
    has_deviation: hasDeviation,
    max_deviation_severity: maxDeviationSeverity,
    hero_hand_json: heroHand ? JSON.stringify(heroHand) : null,
  };
}

/** Convert a HandRecord to the lightweight HandSummary used in lists */
export function toHandSummary(record: HandRecord): HandSummary {
  return {
    id: record.id,
    hand_number: record.hand_number,
    session_id: record.session_id,
    date: record.date,
    position: record.hero_position,
    result_bb: record.hero_result_bb,
    street_reached: record.street_reached as HandSummary['street_reached'],
    has_deviation: record.has_deviation,
    max_deviation_severity: record.max_deviation_severity as HandSummary['max_deviation_severity'],
    hero_hand: record.hero_hand_json ? JSON.parse(record.hero_hand_json) : null,
  };
}

/** Delete the entire database (useful for dev/reset) */
export async function clearDatabase(): Promise<void> {
  await db.delete();
  // Dexie auto-recreates on next access
  await db.open();
}
