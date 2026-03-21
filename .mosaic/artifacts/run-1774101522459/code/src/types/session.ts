// ============================================================
// Session types — Session lifecycle
// ============================================================

import type { BlindStructure, Player } from './game';

export type SessionStatus = 'active' | 'paused' | 'completed';

export type SeatPreference = 'auto' | 'manual';

export interface CreateSessionRequest {
  seatPreference: SeatPreference;
  selectedSeat?: number;
}

export interface Session {
  id: string;
  status: SessionStatus;
  players: Player[];
  blinds: BlindStructure;
  startedAt: string;
  pausedAt: string | null;
  endedAt: string | null;
  handCount: number;
  currentHandId: string | null;
  dealerSeat: number;
}

export interface SessionSummary {
  id: string;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  handCount: number;
  profitLossBB: number;
}

export interface SessionEndSummary {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  handCount: number;
  profitLossBB: number;
  avgEvLossPerHand: number;
}
