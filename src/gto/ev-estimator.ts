import type { ActionType, Street, Position, Card, GTORating } from '../types';
import type { EVEstimate } from './types';

export function estimateEV(
  _params: {
    street: Street;
    position: Position;
    holeCards: [Card, Card];
    communityCards: Card[];
    userAction: ActionType;
    gtoAction: ActionType;
    potSize: number;
    betAmount?: number;
  },
): EVEstimate {
  return {
    evDifferenceBB: 0,
    rating: 'optimal' as GTORating,
    isApproximate: false,
  };
}

export function rateDecision(
  _userAction: ActionType,
  _gtoAction: ActionType,
  _evDiff: number,
): GTORating {
  return 'optimal';
}
