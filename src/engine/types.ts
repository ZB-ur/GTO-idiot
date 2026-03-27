import type { Card, ActionType, Street, Position, SidePot, AvailableActions, WinnerInfo } from '../types';

export interface Deck {
  cards: Card[];
  nextIndex: number;
}

export type HandRankCategory =
  | 'high_card'
  | 'one_pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush';

export interface HandRank {
  category: HandRankCategory;
  rank: number;
  description: string;
  bestFive: Card[];
}

export interface PlayerState {
  playerId: string;
  seatIndex: number;
  position: Position;
  chipCount: number;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  holeCards: [Card, Card] | null;
}

export interface BettingRoundState {
  street: Street;
  pot: number;
  sidePots: SidePot[];
  players: PlayerState[];
  currentPlayerIndex: number;
  lastRaiserIndex: number | null;
  minRaise: number;
  isComplete: boolean;
}

export interface EngineGameState {
  handId: string;
  handNumber: number;
  deck: Deck;
  street: Street;
  pot: number;
  sidePots: SidePot[];
  communityCards: Card[];
  players: PlayerState[];
  dealerIndex: number;
  currentPlayerIndex: number;
  isHandComplete: boolean;
  result: { winners: WinnerInfo[]; showdown: boolean } | null;
}

export interface ActionResult {
  newState: EngineGameState;
  isStreetComplete: boolean;
  isHandComplete: boolean;
}

export { type Card, type ActionType, type Street, type Position, type AvailableActions };
