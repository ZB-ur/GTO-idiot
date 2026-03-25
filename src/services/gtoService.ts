import type {
  Position,
  PreflopScenario,
  FacingAction,
  PreflopRangeResponse,
  GtoLookupResult,
  PostflopGtoResult,
  PostflopStrategiesResponse,
  PostflopFacingAction,
  PostflopStreet,
  Card,
} from '../types';

export function getPreflopRanges(
  position: Position,
  scenario: PreflopScenario
): PreflopRangeResponse {
  void position;
  void scenario;
  return {
    position,
    scenario,
    rangePercentage: 0,
    matrix: [],
  };
}

export function lookupPreflopGto(
  position: Position,
  hand: string,
  facingAction: FacingAction
): GtoLookupResult {
  void hand;
  void facingAction;
  return {
    position,
    hand,
    facingAction,
    recommendedAction: 'fold',
    frequency: 1.0,
    alternativeActions: [],
    reason: 'Default fold',
    reasonZh: '默认弃牌',
    isSimplified: true,
  };
}

export function lookupPostflopGto(
  position: Position,
  communityCards: Card[],
  holeCards: Card[],
  street: PostflopStreet,
  facingAction: PostflopFacingAction
): PostflopGtoResult {
  void position;
  void communityCards;
  void holeCards;
  return {
    boardTexture: 'dry',
    position: 'IP',
    sprRange: 'medium',
    street,
    facingAction,
    recommendedActions: [],
    keyPrinciple: 'Stub',
    keyPrincipleZh: '占位',
    isSimplified: true,
  };
}

export function getPostflopStrategies(): PostflopStrategiesResponse {
  return {
    sections: [],
  };
}
