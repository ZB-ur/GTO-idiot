// ============================================================
// Barrel export for all shared types
// ============================================================

export type {
  Rank,
  Suit,
  Card,
  CardNotation,
  HandCombo,
} from './cards';

export {
  RANKS,
  SUITS,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  RANK_VALUES,
  DECK_SIZE,
  cardToNotation,
  notationToCard,
} from './cards';

export type {
  Position,
  Street,
  ActionType,
  HandPhase,
  BotStyle,
  DecisionQuality,
  BlindStructure,
  Player,
  HandPlayer,
  Pot,
  HandState,
  LegalAction,
  AvailableActions,
  PlayerAction,
  ActionLogEntry,
  ActionResult,
  BotActionResult,
  Winner,
  HandSettlement,
  ApiError,
} from './game';

export {
  POSITIONS,
  MAX_PLAYERS,
  DEFAULT_BLINDS,
  DEFAULT_STARTING_STACK_BB,
} from './game';

export type {
  SessionStatus,
  SeatPreference,
  CreateSessionRequest,
  Session,
  SessionSummary,
  SessionEndSummary,
} from './session';

export type {
  PreflopRangeAction,
  PreflopScenario,
  PreflopRange,
  GTOEvaluationRequest,
  GTOActionEV,
  GTOEvaluationResult,
  GTOBatchRequest,
  GameSnapshot,
  DecisionPointAnalysis,
  GTOBatchResult,
} from './gto';

export {
  EV_THRESHOLD_GOOD,
  EV_THRESHOLD_MINOR,
  classifyDecisionQuality,
} from './gto';

export type {
  StatsOverview,
  PositionStats,
  StreetStats,
  ProfitTrendGroupBy,
  ProfitTrendDataPoint,
  ProfitTrend,
} from './stats';

// ============================================================
// Hand History types (used by persistence + replay)
// ============================================================

import type { Card } from './cards';
import type { ActionLogEntry, BlindStructure, BotStyle, HandSettlement, Position, Street } from './game';
import type { DecisionPointAnalysis } from './gto';

export interface SeatRecord {
  seat: number;
  name: string;
  position: Position;
  isHuman: boolean;
  botStyle: BotStyle | null;
  startingStackBB: number;
  holeCards: Card[];
}

export interface HandHistory {
  id: string;
  sessionId: string;
  timestamp: string;
  handNumber: number;
  dealerSeat: number;
  blinds: BlindStructure;
  seats: SeatRecord[];
  communityCards: Card[];
  actionSequence: ActionLogEntry[];
  settlement: HandSettlement;
}

export interface HandHistorySummary {
  id: string;
  sessionId: string;
  timestamp: string;
  handNumber: number;
  userPosition: Position;
  userHoleCards: Card[];
  communityCards: Card[];
  result: 'won' | 'lost' | 'folded';
  profitLossBB: number;
  reachedStreet: Street;
}

export interface HandHistoryList {
  hands: HandHistorySummary[];
  total: number;
  nextCursor: string | null;
}

export interface TimelineMarker {
  label: string;
  street: Street;
  decisionPointIndices: number[];
}

export interface HandReplayData {
  handHistory: HandHistory;
  decisionPoints: DecisionPointAnalysis[];
  totalEvLossBB: number;
  timelineMarkers: TimelineMarker[];
}
