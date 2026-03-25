import type { Card, Position, ActionType, Street, GtoRating, BotStyle } from './card';

export interface PlayerInfo {
  seatIndex: number;
  position: Position;
  name: string;
  isBot: boolean;
  botStyle?: BotStyle;
  botIcon?: string;
  chipCount: number;
  isActive: boolean;
  isSittingOut: boolean;
}

export interface PotInfo {
  mainPot: number;
  sidePots: SidePot[];
  totalPot: number;
}

export interface SidePot {
  amount: number;
  eligiblePlayers: number[];
}

export interface HandPlayerState {
  seatIndex: number;
  position: Position;
  chipCount: number;
  currentBet: number;
  totalInvested: number;
  hasFolded: boolean;
  isAllIn: boolean;
  lastAction?: ActionType;
  lastActionAmount?: number;
  holeCards?: Card[];
}

export interface HandState {
  handId: string;
  handNumber: number;
  street: Street;
  communityCards: Card[];
  userHoleCards: Card[];
  pot: PotInfo;
  players: HandPlayerState[];
  currentActorSeatIndex: number;
  isUserTurn: boolean;
  dealerSeatIndex: number;
  isComplete: boolean;
  result?: HandResult;
}

export interface HandResult {
  winners: WinnerInfo[];
  userNetResult: number;
  wonByFold: boolean;
  showdownOccurred: boolean;
  allPlayerHoleCards: { seatIndex: number; holeCards: Card[] }[];
}

export interface WinnerInfo {
  seatIndex: number;
  amountWon: number;
  handRank: string;
  bestFiveCards: Card[];
  potType: 'main' | 'side';
}

export interface GameSession {
  sessionId: string;
  players: PlayerInfo[];
  userSeatIndex: number;
  dealerSeatIndex: number;
  blinds: { smallBlind: number; bigBlind: number };
  handCount: number;
  isHandInProgress: boolean;
  createdAt: string;
}

export interface GameEndSummary {
  sessionId: string;
  handsPlayed: number;
  netResult: number;
  gtoConformance: number;
  duration: number;
}

export interface CreateGameRequest {
  seatIndex: number;
  buyInBb?: number;
}

export interface ChangeSeatRequest {
  newSeatIndex: number;
}

export interface LegalAction {
  type: ActionType;
  isAvailable: boolean;
  minAmount?: number;
  maxAmount?: number;
  callAmount?: number;
}

export interface PotPreset {
  label: string;
  fraction: number;
  amount: number;
}

export interface LegalActionsResponse {
  isUserTurn: boolean;
  actions: LegalAction[];
  potPresets: PotPreset[];
}

export interface PlayerActionRequest {
  actionType: ActionType;
  amount?: number;
}

export interface ActionResult {
  handState: HandState;
  actionRecorded: {
    seatIndex: number;
    actionType: ActionType;
    amount: number;
    potAfter: number;
    timestamp: string;
  };
  gtoComparison?: GtoComparisonResult;
  streetComplete: boolean;
  handComplete: boolean;
}

export interface BotActionResult {
  handState: HandState;
  botAction: {
    seatIndex: number;
    botName: string;
    botStyle: BotStyle;
    actionType: ActionType;
    amount: number;
    displayDelay: number;
  };
  streetComplete: boolean;
  handComplete: boolean;
}

export interface AdvanceResult {
  handState: HandState;
  newStreet: Street;
  newCards: Card[];
  isShowdown: boolean;
}

export interface GtoComparisonResult {
  userAction: ActionType;
  userAmount?: number;
  gtoRecommendedAction: ActionType;
  gtoRecommendedAmount?: number;
  rating: GtoRating;
  reason: string;
  reasonZh: string;
  isSimplified: boolean;
  street: Street;
  position: Position;
  hand: string;
}

export interface AppState {
  hasExistingData: boolean;
  storageAvailable: boolean;
  lastSessionSummary?: {
    totalHands: number;
    overallWinRate: number;
    gtoConformance: number;
    lastPlayedAt: string;
  };
  detectedLanguage: 'zh' | 'en';
  savedLanguage?: 'zh' | 'en';
}

export interface UserSettings {
  language: 'zh' | 'en';
  botSpeed: 'slow' | 'normal' | 'fast';
  botSpeedMs: number;
  defaultBuyIn: number;
  lastSeatIndex?: number;
}

export interface UpdateSettingsRequest {
  language?: 'zh' | 'en';
  botSpeed?: 'slow' | 'normal' | 'fast';
  defaultBuyIn?: number;
}

export interface StorageStatus {
  usedBytes: number;
  maxBytes: number;
  usagePercentage: number;
  handRecordCount: number;
  maxHandRecords: number;
  isNearLimit: boolean;
  isAvailable: boolean;
}

export interface CleanupRequest {
  keepRecentCount: number;
}

export interface CleanupResult {
  deletedCount: number;
  remainingCount: number;
  freedBytes: number;
  newUsagePercentage: number;
}

export interface HandRecord {
  handId: string;
  handNumber: number;
  sessionId: string;
  timestamp: string;
  userSeatIndex: number;
  userPosition: Position;
  userHoleCards: Card[];
  communityCards: Card[];
  players: HandRecordPlayer[];
  actions: RecordedAction[];
  result: HandResult;
  gtoConformance: number;
  gtoRating: GtoRating;
  userDecisionCount: number;
  gtoMatchCount: number;
  isComplete: boolean;
}

export interface HandRecordPlayer {
  seatIndex: number;
  position: Position;
  name: string;
  isBot: boolean;
  botStyle?: BotStyle;
  startingChips: number;
  endingChips: number;
  holeCards: Card[];
}

export interface RecordedAction {
  stepIndex: number;
  seatIndex: number;
  position: Position;
  playerName: string;
  isUser: boolean;
  street: Street;
  actionType: ActionType;
  amount: number;
  potAfter: number;
  timestamp: string;
  gtoComparison?: GtoComparisonResult;
}

export interface HandHistoryListResponse {
  hands: HandHistorySummary[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface HandHistorySummary {
  handId: string;
  handNumber: number;
  timestamp: string;
  userPosition: Position;
  userHoleCards: Card[];
  netResult: number;
  gtoConformance: number;
  gtoRating: GtoRating;
  isComplete: boolean;
}

export interface HandReplayResponse {
  handId: string;
  totalSteps: number;
  players: HandRecordPlayer[];
  steps: ReplayStep[];
  summary: HandReplaySummary;
}

export interface ReplayStep {
  stepIndex: number;
  street: Street;
  communityCardsVisible: Card[];
  action: RecordedAction;
  playerStates: ReplayPlayerState[];
  pot: PotInfo;
  isUserDecisionPoint: boolean;
  gtoComparison?: GtoComparisonResult;
}

export interface ReplayPlayerState {
  seatIndex: number;
  chipCount: number;
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  holeCardsVisible: boolean;
}

export interface HandReplaySummary {
  gtoConformance: number;
  totalUserDecisions: number;
  gtoMatches: number;
  keyDeviations: KeyDeviation[];
  netResult: number;
}

export interface KeyDeviation {
  stepIndex: number;
  rating: GtoRating;
  userAction: string;
  gtoAction: string;
  reason: string;
  reasonZh: string;
}

export interface StatisticsDashboard {
  totalHands: number;
  totalPnl: number;
  overallWinRate: number;
  gtoConformance: number;
  hasEnoughData: boolean;
  minimumHandsForTrend: number;
}

export interface TrendDataResponse {
  groupBy: 'per_10_hands' | 'per_session';
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  label: string;
  gtoConformance: number;
  handsCount: number;
  timestamp: string;
}

export interface ErrorCategoriesResponse {
  totalErrors: number;
  categories: ErrorCategory[];
}

export interface ErrorCategory {
  errorType: string;
  title: string;
  titleZh: string;
  count: number;
  percentage: number;
  severity: GtoRating;
}

export interface ErrorTypeDetail {
  errorType: string;
  title: string;
  titleZh: string;
  explanation: string;
  explanationZh: string;
  improvementTip: string;
  improvementTipZh: string;
  relatedHandCount: number;
  count: number;
  percentage: number;
}
