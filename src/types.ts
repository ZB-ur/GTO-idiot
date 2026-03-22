// ===== Enums & Literals =====

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 's' | 'h' | 'd' | 'c';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type HandRank =
  | 'high_card' | 'one_pair' | 'two_pair' | 'three_of_a_kind'
  | 'straight' | 'flush' | 'full_house' | 'four_of_a_kind'
  | 'straight_flush' | 'royal_flush';
export type BotStyle = 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';
export type BlindLevel = '1/2' | '2/5' | '5/10';
export type Speed = 'fast' | 'normal' | 'slow';
export type DeviationSeverity = 'match' | 'minor' | 'major';
export type HandStatus = 'in_progress' | 'showdown' | 'concluded';
export type HandOutcome = 'won' | 'lost' | 'folded' | 'split';
export type ProfitFilter = 'profit' | 'loss' | 'all';
export type SortBy = 'date_desc' | 'date_asc' | 'profit_desc' | 'profit_asc';

// ===== Core Data =====

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

// ===== Player =====

export interface PlayerInfo {
  playerId: string;
  name: string;
  position: Position;
  chipStack: number;
  isHuman: boolean;
  isActive: boolean;
  botStyle?: BotStyle;
}

export interface HandPlayerState {
  playerId: string;
  position: Position;
  chipStack: number;
  bet: number;
  holeCards?: Card[];
  isFolded: boolean;
  isAllIn: boolean;
  hasActed: boolean;
}

export interface HandRecordPlayer {
  playerId: string;
  name: string;
  position: Position;
  startingStack: number;
  holeCards: Card[];
  isHuman: boolean;
  botStyle?: BotStyle;
}

// ===== Hand & Game State =====

export interface HandResult {
  winners: {
    playerId: string;
    amount: number;
    handRank?: HandRank;
    bestFiveCards?: Card[];
  }[];
  playerProfit: number;
}

export interface HandState {
  handId: string;
  street: Street;
  pot: number;
  mainPot?: number;
  sidePots?: SidePot[];
  communityCards: Card[];
  dealerPosition: Position;
  activePlayerId: string | null;
  isPlayerTurn?: boolean;
  players: HandPlayerState[];
  status: HandStatus;
  result?: HandResult;
}

export interface GameState {
  gameId: string;
  blindLevel: BlindLevel;
  speed: Speed;
  players: PlayerInfo[];
  currentHand: HandState | null;
  handCount: number;
  sessionProfit: number;
}

export interface GameSummary {
  gameId: string;
  handsPlayed: number;
  totalProfit: number;
  sessionDurationMinutes: number;
}

// ===== Actions =====

export interface PlayerAction {
  action: ActionType;
  amount?: number;
}

export interface ActionEvent {
  playerId: string;
  playerName?: string;
  position: Position;
  action: ActionType;
  amount?: number;
  street: Street;
  potAfter?: number;
  timestamp: number;
  isStreetTransition?: boolean;
  newCommunityCards?: Card[];
}

export interface AvailableActions {
  actions: ActionType[];
  potSize: number;
  toCall: number;
  minRaise?: number;
  maxRaise?: number;
  presetRaiseSizes?: { label: string; amount: number }[];
}

export interface ActionResult {
  gameState: GameState;
  processedActions: ActionEvent[];
}

export interface CreateGameRequest {
  blindLevel: BlindLevel;
  startingStackBB?: number;
  speed?: Speed;
}

// ===== Hand Evaluation =====

export interface HandEvaluation {
  rank: HandRank;
  rankValue: number;
  bestFiveCards: Card[];
  description: string;
}

export interface HandEvaluationRequest {
  hands: { playerId: string; holeCards: Card[] }[];
  communityCards: Card[];
}

export interface HandEvaluationResult {
  evaluations: {
    playerId: string;
    rank: HandRank;
    rankDescription?: string;
    bestFiveCards: Card[];
    rankValue: number;
  }[];
  winners: string[];
}

// ===== GTO =====

export interface StrategyAction {
  action: string;
  frequency: number;
  sizing?: string;
}

export interface PreflopHandStrategy {
  hand: string;
  actions: StrategyAction[];
}

export interface PostflopStrategy {
  handCategory: string;
  actions: StrategyAction[];
}

export interface PreflopStrategyTable {
  positions: Record<string, Record<string, PreflopHandStrategy[]>>;
}

export interface PostflopStrategyData {
  boardTexture: string;
  street: string;
  scenarios: Record<string, PostflopStrategy[]>;
}

export interface GTOLookupRequest {
  holeCards: Card[];
  position: Position;
  street: Street;
  communityCards?: Card[];
  potSize?: number;
  actionHistory?: ActionEvent[];
  scenario?: string;
}

export interface GTORecommendation {
  actions: StrategyAction[];
  scenario?: string;
  explanation?: string;
}

export interface GTOAnalysis {
  deviation: DeviationSeverity;
  actualActionFrequency?: number;
  recommendedActions: StrategyAction[];
  explanation?: string;
  scenario?: string;
}

export type BoardTexture =
  | 'high_dry_rainbow' | 'high_dry_two_tone' | 'high_dry_monotone'
  | 'high_wet_rainbow' | 'high_wet_two_tone' | 'high_wet_monotone'
  | 'mid_dry_rainbow' | 'mid_dry_two_tone' | 'mid_dry_monotone'
  | 'mid_wet_rainbow' | 'mid_wet_two_tone' | 'mid_wet_monotone'
  | 'low_dry_rainbow' | 'low_dry_two_tone' | 'low_dry_monotone'
  | 'low_wet_rainbow' | 'low_wet_two_tone' | 'low_wet_monotone';

// ===== History & Persistence =====

export interface StreetRecord {
  street: Street;
  communityCards?: Card[];
  actions: ActionEvent[];
  potAtStart: number;
  potAtEnd?: number;
}

export interface HandRecord {
  handId: string;
  playedAt: string;
  blindLevel: BlindLevel;
  dealerPosition: Position;
  players: HandRecordPlayer[];
  streets: StreetRecord[];
  result: HandResult;
}

export interface HandHistorySummary {
  handId: string;
  playedAt: string;
  blindLevel: BlindLevel;
  playerPosition: Position;
  holeCards: Card[];
  profit: number;
  result: HandOutcome;
  finalStreet: Street;
}

export interface HandHistoryPage {
  items: HandHistorySummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OverallStats {
  totalHands: number;
  totalProfit: number;
  avgProfitPerHand: number;
  winRate?: number;
  vpip?: number;
  pfr?: number;
}

export interface HistoryFilter {
  dateFrom?: string;
  dateTo?: string;
  blindLevel?: BlindLevel;
  profitFilter?: ProfitFilter;
  sortBy?: SortBy;
}

// ===== Replay =====

export interface ReplayAction {
  playerId: string;
  playerName?: string;
  position: Position;
  action: ActionType;
  amount?: number;
  isPlayerAction: boolean;
  gtoAnalysis?: GTOAnalysis;
}

export interface ReplayStreet {
  street: Street;
  communityCards?: Card[];
  pot?: number;
  actions: ReplayAction[];
}

export interface HandReplay {
  handId: string;
  handRecord: HandRecord;
  streets: ReplayStreet[];
  overallCompliance: number;
}

// ===== Report =====

export interface WeaknessItem {
  weaknessId: string;
  scenario: string;
  compliance: number;
  occurrences: number;
  suggestion: string;
  relatedHandCount?: number;
}

export interface GTOComplianceReport {
  handsAnalyzed: number;
  dateRange?: { from: string; to: string };
  overallCompliance: number;
  totalDecisionPoints?: number;
  byStreet: { street: Street; compliance: number; decisionCount: number }[];
  byDecisionType: { decisionType: string; compliance: number; decisionCount: number }[];
  topWeaknesses: WeaknessItem[];
}

// ===== Settings =====

export interface Settings {
  blindLevel: BlindLevel;
  startingStackBB: number;
  speed: Speed;
  soundEnabled: boolean;
}

export interface SettingsUpdate {
  blindLevel?: BlindLevel;
  startingStackBB?: number;
  speed?: Speed;
  soundEnabled?: boolean;
}

// ===== Bot =====

export interface BotStyleProfile {
  style: BotStyle;
  aggressionFactor: number;
  vpipAdjust: number;
  pfrAdjust: number;
  threeBetAdjust: number;
  foldTo3BetAdjust: number;
  cbetAdjust: number;
  checkRaiseAdjust: number;
}

// ===== Error =====

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
