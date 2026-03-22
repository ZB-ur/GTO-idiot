// Core poker domain types derived from API spec

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface BlindStructure {
  smallBlind: number;
  bigBlind: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  chipStack: number;
  isBot: boolean;
  isActive: boolean;
  holeCards?: [Card, Card];
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
}

export interface PotInfo {
  mainPot: number;
  sidePots?: Array<{
    amount: number;
    eligiblePlayerIds: string[];
  }>;
}

export interface WinnerInfo {
  winners: Array<{
    playerId: string;
    amount: number;
    handRank: string;
    holeCards?: [Card, Card];
  }>;
}

export interface PlayerAction {
  actionType: ActionType;
  amount?: number;
}

export interface ActionRecord {
  playerId: string;
  playerName: string;
  position: Position;
  actionType: ActionType;
  amount?: number;
  street: Street;
  potAfterAction?: number;
  timestamp: number;
}

export interface AvailableAction {
  actionType: ActionType;
  isAvailable: boolean;
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
  suggestedSizings?: Array<{
    label: string;
    amount: number;
  }>;
}

export interface AvailableActions {
  actions: AvailableAction[];
  potOdds?: string;
  potSize?: number;
}

export interface HandState {
  handId: string;
  handNumber: number;
  street: Street;
  pot: PotInfo;
  players: Player[];
  communityCards: Card[];
  isHumanTurn: boolean;
  isHandComplete: boolean;
  currentPlayerIndex: number;
  recentActions?: ActionRecord[];
  winnerInfo?: WinnerInfo;
  humanHandStrength?: string;
}

export interface ActionResult {
  handState: HandState;
  processedActions: ActionRecord[];
}

// Hand history types
export interface HandPlayerInfo {
  playerId: string;
  name: string;
  position: Position;
  startingStack: number;
  holeCards: [Card, Card];
  isBot: boolean;
}

export interface StreetRecord {
  street: Street;
  communityCards?: Card[];
  actions: ActionRecord[];
  potAtEnd?: number;
}

export interface HandResult {
  winners: Array<{
    playerId: string;
    amountWon: number;
    handRank: string;
  }>;
  potTotal: number;
  humanNetResult?: number;
  wentToShowdown?: boolean;
}

export interface HandHistory {
  handId: string;
  sessionId: string;
  handNumber: number;
  startedAt: string;
  players: HandPlayerInfo[];
  streets: StreetRecord[];
  result: HandResult;
}

export interface HandSummary {
  handId: string;
  handNumber: number;
  humanPosition: Position;
  humanHoleCards?: [Card, Card];
  humanResult: number;
  gtoConformance: 'conforming' | 'minor_deviation' | 'major_deviation' | 'mixed';
}

// Error types
export type ErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_ACTION'
  | 'SESSION_ENDED'
  | 'HAND_IN_PROGRESS'
  | 'NO_ACTIVE_HAND'
  | 'STORAGE_ERROR'
  | 'DATA_CORRUPTION'
  | 'GTO_TABLE_LOAD_FAILED';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
