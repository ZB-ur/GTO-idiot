import type { Card, HoleCards } from './card';

/** Player seat position at a 6-max table */
export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

/** All positions in dealing order */
export const POSITIONS: readonly Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] as const;

/** Betting street */
export type Street = 'preflop' | 'flop' | 'turn' | 'river';

/** Player action type */
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

/** Hand phase / lifecycle state */
export type HandPhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete';

/** Blind size configuration */
export interface BlindSize {
  readonly smallBlind: number;
  readonly bigBlind: number;
}

/** Request to create a new game session */
export interface CreateGameRequest {
  readonly seatPosition: Position;
  readonly startingStack?: number; // default 100 BB
  readonly blindSize?: BlindSize;
}

/** Player info within a game session */
export interface PlayerInfo {
  readonly id: string;
  readonly name: string;
  readonly position: Position;
  readonly stack: number;
  readonly isUser: boolean;
  readonly isActive: boolean;
  readonly botStyle?: import('./bot').BotStyle;
}

/** A game session (multi-hand cash game) */
export interface GameSession {
  readonly id: string;
  readonly status: 'active' | 'ended';
  readonly seatPosition: Position;
  readonly players: readonly PlayerInfo[];
  readonly handsPlayed: number;
  readonly currentHandId: string | null;
  readonly blindSize: BlindSize;
  readonly createdAt: string;
}

/** Player state within a single hand */
export interface HandPlayerState {
  readonly playerId: string;
  readonly name: string;
  readonly position: Position;
  readonly stack: number;
  readonly currentBet: number;
  readonly isFolded: boolean;
  readonly isAllIn: boolean;
  readonly isActive: boolean;
  readonly lastAction?: ActionType;
  readonly holeCards?: HoleCards;
}

/** A single action in the action history */
export interface ActionEntry {
  readonly playerId: string;
  readonly playerName: string;
  readonly position: Position;
  readonly action: ActionType;
  readonly amount?: number;
  readonly street: Street;
  readonly potAfterAction?: number;
  readonly timestamp: string;
  readonly isUserAction?: boolean;
}

/** Side pot definition */
export interface SidePot {
  readonly amount: number;
  readonly eligiblePlayers: readonly string[];
}

/** Winner information */
export interface WinnerInfo {
  readonly playerId: string;
  readonly playerName: string;
  readonly amount: number;
  readonly handRank?: string;
  readonly holeCards?: HoleCards;
}

/** Complete state of a single hand in progress */
export interface HandState {
  readonly id: string;
  readonly gameId: string;
  readonly handNumber?: number;
  readonly phase: HandPhase;
  readonly pot: number;
  readonly sidePots?: readonly SidePot[];
  readonly communityCards: readonly Card[];
  readonly players: readonly HandPlayerState[];
  readonly dealerPosition: Position;
  readonly currentActorId: string | null;
  readonly isUserTurn: boolean;
  readonly userHoleCards?: HoleCards;
  readonly actionHistory: readonly ActionEntry[];
  readonly winners?: readonly WinnerInfo[] | null;
}

/** Available action for the current player */
export interface AvailableAction {
  readonly type: ActionType;
  readonly isEnabled: boolean;
  readonly amount?: number;
  readonly minAmount?: number;
  readonly maxAmount?: number;
  readonly presets?: readonly RaisePreset[];
}

/** Raise preset (e.g. ½ Pot, ¾ Pot) */
export interface RaisePreset {
  readonly label: string;
  readonly amount: number;
}

/** Set of available actions for the current decision point */
export interface AvailableActions {
  readonly handId: string;
  readonly currentPot: number;
  readonly userStack: number;
  readonly effectiveStack?: number;
  readonly amountToCall?: number;
  readonly actions: readonly AvailableAction[];
}

/** Player action submission */
export interface PlayerAction {
  readonly action: ActionType;
  readonly amount?: number;
}

/** Result of submitting an action */
export interface ActionResult {
  readonly handState: HandState;
  readonly processedActions: readonly ActionEntry[];
  readonly handComplete?: boolean;
}

/** Complete hand record for history */
export interface HandRecord {
  readonly id: string;
  readonly gameId: string;
  readonly handNumber: number;
  readonly dealerPosition?: Position;
  readonly players: readonly HandRecordPlayer[];
  readonly communityCards: readonly Card[];
  readonly actionsByStreet: ActionsByStreet;
  readonly result: HandResult;
  readonly playedAt: string;
}

/** Player entry in a hand record */
export interface HandRecordPlayer {
  readonly playerId: string;
  readonly name: string;
  readonly position: Position;
  readonly startingStack: number;
  readonly endingStack: number;
  readonly holeCards?: HoleCards;
  readonly isUser?: boolean;
}

/** Actions organized by street */
export interface ActionsByStreet {
  readonly preflop?: readonly ActionEntry[];
  readonly flop?: readonly ActionEntry[];
  readonly turn?: readonly ActionEntry[];
  readonly river?: readonly ActionEntry[];
}

/** Hand result summary */
export interface HandResult {
  readonly winners: readonly WinnerInfo[];
  readonly finalPot: number;
  readonly userProfit?: number;
  readonly wentToShowdown?: boolean;
}

/** Summary for hand history list */
export interface HandHistorySummary {
  readonly id: string;
  readonly handNumber: number;
  readonly position: Position;
  readonly holeCards?: HoleCards;
  readonly result: number;
  readonly keyAction?: string;
  readonly playedAt: string;
}

/** Paginated hand history list */
export interface HandHistoryList {
  readonly hands: readonly HandHistorySummary[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
}
