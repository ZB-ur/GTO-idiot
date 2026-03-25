import type { Card } from './card';

export type HandRankType =
  | 'high_card'
  | 'one_pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface HandRank {
  type: HandRankType;
  value: number;
  description: string;
  bestFiveCards: Card[];
}

export interface DeckState {
  cards: Card[];
  dealtCount: number;
}

export interface BettingRoundState {
  currentBetToMatch: number;
  minRaise: number;
  lastRaiseAmount: number;
  actorIndex: number;
  playersActed: Set<number>;
  isComplete: boolean;
}

export interface PotCalculation {
  mainPot: number;
  sidePots: { amount: number; eligiblePlayers: number[] }[];
  totalPot: number;
}

export interface ShowdownResult {
  seatIndex: number;
  handRank: HandRank;
  amountWon: number;
  potType: 'main' | 'side';
}
