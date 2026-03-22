// Re-export all shared types from a single entry point

export type {
  Rank,
  Suit,
  Position,
  Street,
  ActionType,
  Card,
  BlindStructure,
  Player,
  PotInfo,
  WinnerInfo,
  PlayerAction,
  ActionRecord,
  AvailableAction,
  AvailableActions,
  HandState,
  ActionResult,
  HandPlayerInfo,
  StreetRecord,
  HandResult,
  HandHistory,
  HandSummary,
  ErrorCode,
  AppError,
} from './poker';

export type {
  SessionStatus,
  Session,
  SessionSummary,
  SessionEndSummary,
  SessionState,
  SessionSortBy,
  SortOrder,
  ListSessionsParams,
  ListSessionsResult,
  ListHandsParams,
} from './session';

export type {
  PreflopScenario,
  PreflopAction,
  PreflopActionEntry,
  PreflopCell,
  PreflopChart,
  BoardTexture,
  HandStrengthTier,
  PostflopAction,
  PostflopRecommendation,
  PostflopGuide,
  AllPreflopCharts,
  AllPostflopGuides,
} from './gto';

export type {
  DeviationLevel,
  OverallConformance,
  GTOComparison,
  ReviewAction,
  ReviewStreet,
  HandReview,
  SessionReview,
} from './review';

export type {
  StatsSummary,
  ConformanceTrendPoint,
  ConformanceTrend,
  PositionBreakdownEntry,
  PositionBreakdown,
  StreetBreakdownEntry,
  StreetBreakdown,
  DeviationEntry,
  TopDeviations,
  StatsQueryParams,
} from './stats';

// App-wide constants
export const POSITIONS: readonly Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;
export const STREETS: readonly Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const;
export const RANKS: readonly Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

export const DEFAULT_BLINDS: BlindStructure = { smallBlind: 1, bigBlind: 2 };
export const PLAYER_COUNT = 6;
export const STARTING_STACK_BB = 100;

// Import the actual types for const values
import type { Position, Street, Rank, Suit, BlindStructure } from './poker';
