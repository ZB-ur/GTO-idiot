import type { Card, ActionType, Position, GtoRating } from './card';

export type BoardTexture = 'dry' | 'wet' | 'monotone';
export type RelativePosition = 'IP' | 'OOP';
export type SprRange = 'low' | 'medium' | 'high';
export type HandType = 'pair' | 'suited' | 'offsuit';
export type PreflopScenario = 'open_raise' | 'vs_3bet' | 'vs_4bet' | 'vs_open' | 'squeeze';
export type FacingAction = 'unopened' | 'facing_raise' | 'facing_3bet' | 'facing_4bet';
export type PostflopFacingAction = 'first_to_act' | 'facing_bet' | 'facing_raise';
export type PostflopStreet = 'flop' | 'turn' | 'river';

export interface RangeCell {
  hand: string;
  row: number;
  col: number;
  handType: HandType;
  inRange: boolean;
  actions: RangeAction[];
  colorIntensity: number;
}

export interface RangeAction {
  actionType: ActionType;
  frequency: number;
}

export interface PreflopRangeResponse {
  position: Position;
  scenario: PreflopScenario;
  rangePercentage: number;
  matrix: RangeCell[];
}

export interface GtoLookupResult {
  position: Position;
  hand: string;
  facingAction: FacingAction;
  recommendedAction: ActionType;
  recommendedAmount?: number;
  frequency: number;
  alternativeActions: { actionType: ActionType; frequency: number }[];
  reason: string;
  reasonZh: string;
  isSimplified: boolean;
}

export interface PostflopGtoResult {
  boardTexture: BoardTexture;
  position: RelativePosition;
  sprRange: SprRange;
  street: PostflopStreet;
  facingAction: PostflopFacingAction;
  recommendedActions: PostflopRecommendedAction[];
  keyPrinciple: string;
  keyPrincipleZh: string;
  isSimplified: boolean;
}

export interface PostflopRecommendedAction {
  actionType: ActionType;
  frequency: number;
  sizing?: string;
}

export interface BoardTextureSection {
  boardTexture: BoardTexture;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  exampleBoard: Card[];
  strategies: StrategyCardData[];
}

export interface StrategyCardData {
  position: RelativePosition;
  sprRange: SprRange;
  title: string;
  titleZh: string;
  actions: { actionType: string; frequency: string; sizing: string }[];
  keyPrinciple: string;
  keyPrincipleZh: string;
  isSimplified: boolean;
}

export interface PostflopStrategiesResponse {
  sections: BoardTextureSection[];
}

export interface PreflopRangeData {
  [position: string]: {
    [scenario: string]: RangeCell[];
  };
}

export interface PostflopStrategyData {
  [boardTexture: string]: {
    [position: string]: {
      [sprRange: string]: {
        [street: string]: {
          [facingAction: string]: PostflopGtoResult;
        };
      };
    };
  };
}
