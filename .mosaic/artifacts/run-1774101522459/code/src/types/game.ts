// ============================================================
// Game state types — Hand lifecycle, actions, players, pots
// ============================================================

import type { Card } from './cards';

// --- Enums ---

export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export type HandPhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'settled';

export type BotStyle = 'TAG' | 'LAG' | 'TP' | 'LP' | 'GTO';

export type DecisionQuality = 'good' | 'minor_deviation' | 'major_deviation';

// --- Position constants ---

export const POSITIONS: readonly Position[] = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'] as const;

export const MAX_PLAYERS = 6;

// --- Blind structure ---

export interface BlindStructure {
  smallBlind: number;
  bigBlind: number;
}

export const DEFAULT_BLINDS: BlindStructure = {
  smallBlind: 0.5,
  bigBlind: 1.0,
};

export const DEFAULT_STARTING_STACK_BB = 100;

// --- Player ---

export interface Player {
  seat: number;
  name: string;
  isHuman: boolean;
  botStyle: BotStyle | null;
  stackBB: number;
  position: Position;
  isActive: boolean;
  isSittingOut: boolean;
}

export interface HandPlayer {
  seat: number;
  name: string;
  stackBB: number;
  position: Position;
  isActive: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards: Card[] | null;
  lastAction: ActionType | null;
}

// --- Pot ---

export interface Pot {
  amount: number;
  eligibleSeats: number[];
}

// --- Hand state ---

export interface HandState {
  id: string;
  sessionId: string;
  handNumber: number;
  phase: HandPhase;
  players: HandPlayer[];
  communityCards: Card[];
  pots: Pot[];
  currentActingSeat: number | null;
  dealerSeat: number;
  userHoleCards: Card[];
}

// --- Actions ---

export interface LegalAction {
  type: ActionType;
  minAmount?: number;
  maxAmount?: number;
  callAmount?: number;
}

export interface AvailableActions {
  handId: string;
  seat: number;
  actions: LegalAction[];
}

export interface PlayerAction {
  type: ActionType;
  amount?: number;
}

export interface ActionLogEntry {
  seat: number;
  playerName: string;
  action: ActionType;
  amount: number | null;
  street: Street;
  potAfter: number;
  timestamp: string;
}

export interface ActionResult {
  handState: HandState;
  actionLog: ActionLogEntry;
  isHandComplete: boolean;
  nextActorIsBot: boolean;
}

export interface BotActionResult {
  handState: HandState;
  actionLog: ActionLogEntry;
  botDecision: {
    seat: number;
    botStyle: BotStyle;
    action: ActionType;
    amount: number | null;
  };
  isHandComplete: boolean;
  nextActorIsBot: boolean;
}

// --- Settlement ---

export interface Winner {
  seat: number;
  potIndex: number;
  amountWonBB: number;
  handRank: string | null;
}

export interface HandSettlement {
  handId: string;
  winners: Winner[];
  showdownHands: {
    seat: number;
    holeCards: Card[];
    handRank: string;
  }[];
  chipMovements: {
    seat: number;
    changesBB: number;
  }[];
  playerFinalStacks: {
    seat: number;
    stackBB: number;
  }[];
  wonWithoutShowdown: boolean;
}

// --- Error ---

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
