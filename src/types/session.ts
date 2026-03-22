import type { BlindStructure, HandState, Player } from './poker';

export type SessionStatus = 'active' | 'completed';

export interface Session {
  id: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  players: Player[];
  blinds: BlindStructure;
  handCount: number;
  humanPlayerIndex: number;
  dealerIndex: number;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: SessionStatus;
  handCount: number;
  netProfitLossBB: number;
  gtoConformance: number;
}

export interface SessionEndSummary {
  sessionId: string;
  handsPlayed: number;
  netProfitLossBB: number;
  gtoConformance: number;
  duration: number;
  biggestWin?: number;
  biggestLoss?: number;
}

export interface SessionState {
  sessionId: string;
  status: SessionStatus;
  players: Player[];
  currentHandState: HandState | null;
}

export type SessionSortBy = 'date' | 'hands' | 'profitLoss';
export type SortOrder = 'asc' | 'desc';

export interface ListSessionsParams {
  offset?: number;
  limit?: number;
  sortBy?: SessionSortBy;
  sortOrder?: SortOrder;
}

export interface ListSessionsResult {
  sessions: SessionSummary[];
  total: number;
}

export interface ListHandsParams {
  offset?: number;
  limit?: number;
}
