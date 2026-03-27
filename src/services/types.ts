import type { SessionDetail, SessionSummary, HandHistory, HandListItem, Pagination } from '../types';

export interface SessionRecord {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  handsPlayed: number;
  netProfitBB: number;
  status: 'active' | 'completed';
  blinds: { small: number; big: number };
  buyIn: number;
  players: SessionDetail['players'];
  currentHandId: string | null;
  dealerSeatIndex: number;
}

export interface HandRecord {
  handId: string;
  sessionId: string;
  handNumber: number;
  playedAt: string;
  blinds: { small: number; big: number };
  players: HandHistory['players'];
  communityCards: HandHistory['communityCards'];
  streets: HandHistory['streets'];
  result: HandHistory['result'];
}

export interface SessionListResult {
  sessions: SessionSummary[];
  pagination: Pagination;
}

export interface HandListResult {
  hands: HandListItem[];
  pagination: Pagination;
}

export interface PreferenceRecord {
  key: string;
  value: unknown;
}
