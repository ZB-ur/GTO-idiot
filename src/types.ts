// ==================== Card Types ====================
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 's' | 'h' | 'd' | 'c';

export interface Card {
  rank: Rank;
  suit: Suit;
}

// ==================== Position & Action ====================
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'bet' | 'all_in';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type BotStyle = 'TAG' | 'LAG' | 'TightPassive' | 'Fish' | 'Balanced';
export type SessionStatus = 'active' | 'completed';
export type GTORating = 'optimal' | 'acceptable' | 'error';
export type ConfidenceLevel = 'exact' | 'approximate';
export type BoardTexture = 'dry' | 'wet' | 'paired';
export type RelativePosition = 'IP' | 'OOP';
export type SPRRange = 'low' | 'medium' | 'high';
export type HandCategory = 'strong_made' | 'medium_made' | 'weak_made' | 'strong_draw' | 'weak_draw' | 'air';
export type PreflopScenario = 'open' | 'vs_raise' | 'vs_3bet' | 'vs_4bet';

// ==================== Player ====================
export interface PlayerInfo {
  playerId: string;
  nickname: string;
  seatIndex: number;
  isUser: boolean;
  botStyle?: BotStyle;
  chipCount: number;
}

export interface SeatState extends PlayerInfo {
  position: Position;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards: [Card, Card] | null;
  lastAction: string | null;
}

export interface HandHistoryPlayer {
  playerId: string;
  nickname: string;
  seatIndex: number;
  position: Position;
  isUser: boolean;
  botStyle?: BotStyle;
  startingChips: number;
  endingChips: number;
  holeCards: [Card, Card] | null;
}

// ==================== Game State ====================
export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount?: number;
  canRaise: boolean;
  minRaise?: number;
  maxRaise?: number;
}

export interface WinnerInfo {
  playerId: string;
  nickname: string;
  amount: number;
  winningHand?: string | null;
  holeCards?: [Card, Card] | null;
}

export interface HandResult {
  winners: WinnerInfo[];
  showdown: boolean;
}

export interface GameState {
  handId: string;
  handNumber: number;
  street: Street;
  pot: number;
  sidePots?: SidePot[];
  communityCards: Card[];
  seats: SeatState[];
  dealerSeatIndex: number;
  activeSeatIndex: number | null;
  isUserTurn?: boolean;
  availableActions?: AvailableActions;
  isHandComplete: boolean;
  result?: HandResult;
}

// ==================== Actions ====================
export interface PlayerActionRequest {
  actionType: 'fold' | 'check' | 'call' | 'raise';
  amount?: number;
}

export interface ActionLogEntry {
  playerId: string;
  nickname: string;
  actionType: ActionType;
  amount?: number | null;
  street: Street;
  sequenceIndex: number;
  thinkingDelayMs?: number;
}

export interface StreetAction {
  playerId: string;
  nickname: string;
  actionType: ActionType;
  amount?: number | null;
  sequenceIndex: number;
  potAfter: number;
  isUserAction?: boolean;
}

// ==================== Session ====================
export interface SessionSummary {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  handsPlayed: number;
  netProfitBB: number;
  status: SessionStatus;
}

export interface SessionDetail extends SessionSummary {
  blinds: { small: number; big: number };
  buyIn: number;
  players: PlayerInfo[];
  currentHandId?: string | null;
}

export interface Pagination {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

// ==================== Hand History ====================
export interface CommunityCardsRecord {
  flop: [Card, Card, Card] | null;
  turn: Card | null;
  river: Card | null;
}

export interface StreetsRecord {
  preflop: StreetAction[];
  flop?: StreetAction[] | null;
  turn?: StreetAction[] | null;
  river?: StreetAction[] | null;
}

export interface HandHistory {
  handId: string;
  handNumber: number;
  sessionId: string;
  playedAt: string;
  blinds: { small: number; big: number };
  players: HandHistoryPlayer[];
  communityCards: CommunityCardsRecord;
  streets: StreetsRecord;
  result: HandResult;
}

export interface GTORatingSummary {
  optimalCount: number;
  acceptableCount: number;
  errorCount: number;
  totalDecisions: number;
}

export interface HandListItem {
  handId: string;
  handNumber: number;
  sessionId: string;
  playedAt: string;
  holeCards: [Card, Card];
  resultBB: number;
  gtoRating: GTORatingSummary;
}

// ==================== Replay ====================
export interface DecisionSummary {
  decisionIndex: number;
  street: Street;
  sequenceIndex: number;
  userAction: { actionType: ActionType; amount?: number | null };
  gtoAction: { actionType: ActionType; amount?: number | null };
  rating: GTORating;
  evDifferenceBB?: number | null;
  isApproximate: boolean;
}

export interface DecisionDetail {
  decisionIndex: number;
  street: Street;
  position: Position;
  holeCards: [Card, Card];
  communityCards: Card[];
  potSize: number;
  stackSize: number;
  facingBet?: number | null;
  userAction: { actionType: ActionType; amount?: number | null; label: string };
  gtoAction: { actionType: ActionType; amount?: number | null; label: string };
  rating: GTORating;
  evDifferenceBB?: number | null;
  isApproximate: boolean;
  confidenceLevel: ConfidenceLevel;
  explanation: string;
  gtoUnavailable: boolean;
  gtoUnavailableReason?: string | null;
}

export interface HandReplay {
  handId: string;
  handNumber: number;
  playedAt: string;
  holeCards: [Card, Card];
  resultBB: number;
  communityCards: CommunityCardsRecord;
  streets: StreetsRecord;
  decisions: DecisionSummary[];
  overallRating: GTORatingSummary;
}

// ==================== GTO Strategy ====================
export interface RangeCell {
  hand: string;
  action: 'raise' | 'call' | 'fold';
  frequency: number;
}

export interface PreflopStrategy {
  position: Position;
  scenario: PreflopScenario;
  raiserPosition?: Position | null;
  confidenceLevel: ConfidenceLevel;
  rangeMatrix: RangeCell[][];
}

export interface PostflopStrategyRecommendation {
  primaryAction: 'check' | 'bet' | 'call' | 'raise' | 'fold';
  secondaryAction?: 'check' | 'bet' | 'call' | 'raise' | 'fold' | null;
  primaryFrequency: number;
  betSizing?: string | null;
  reasoning: string;
}

export interface PostflopStrategy {
  boardTexture: BoardTexture;
  street: Street;
  position: RelativePosition;
  sprRange: SPRRange;
  handCategory: HandCategory;
  confidenceLevel: ConfidenceLevel;
  recommendation: PostflopStrategyRecommendation;
}

// ==================== Statistics ====================
export interface GTOMetrics {
  complianceRate: number;
  avgEvLossPerHand: number;
  totalDecisions: number;
  evaluatedHands: number;
  isEstimated?: boolean;
}

export interface Statistics {
  totalHands: number;
  netProfitBB: number;
  winRate: number;
  gtoMetrics: GTOMetrics;
  sessionCount?: number;
  handsWithReplay?: number;
}

export interface PLDataPoint {
  handIndex: number;
  cumulativeBB: number;
  handId: string;
  sessionId: string;
}

// ==================== Sound ====================
export interface SoundPreference {
  enabled: boolean;
}

// ==================== Error ====================
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { field: string; reason: string }[];
  };
}
