import type { ActionType, Card, Position, Street } from './poker';

export type DeviationLevel = 'conforming' | 'minor' | 'major';
export type OverallConformance = 'conforming' | 'minor_deviation' | 'major_deviation';

export interface GTOComparison {
  userAction: {
    actionType: ActionType;
    amount?: number;
  };
  gtoAction: {
    actionType: ActionType;
    amount?: number;
    sizing?: string;
  };
  deviationLevel: DeviationLevel;
  evLoss?: number;
  explanation?: string;
}

export interface ReviewAction {
  playerId: string;
  playerName: string;
  position: Position;
  actionType: ActionType;
  amount?: number;
  isHumanAction: boolean;
  gtoComparison?: GTOComparison;
}

export interface ReviewStreet {
  street: Street;
  communityCards?: Card[];
  potAtStart?: number;
  actions: ReviewAction[];
}

export interface HandReview {
  handId: string;
  handNumber: number;
  streets: ReviewStreet[];
  overallConformance: OverallConformance;
  totalEvLoss: number;
  humanPosition?: Position;
  humanHoleCards?: [Card, Card];
}

export interface SessionReview {
  sessionId: string;
  handsReviewed: number;
  overallConformance: number;
  totalEvLoss: number;
  streetBreakdown?: {
    preflop?: number;
    flop?: number;
    turn?: number;
    river?: number;
  };
  biggestDeviations?: Array<{
    handId: string;
    handNumber: number;
    street: Street;
    evLoss: number;
    description: string;
  }>;
}
