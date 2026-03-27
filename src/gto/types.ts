import type {
  Position,
  BotStyle,
  ActionType,
  Street,
  Card,
  HandCategory,
  BoardTexture,
  RelativePosition,
  SPRRange,
  PreflopScenario,
  RangeCell,
  PostflopStrategyRecommendation,
  GTORating,
} from '../types';

export interface BotProfile {
  style: BotStyle;
  aggressionOffset: number;
  tightnessOffset: number;
  bluffFrequency: number;
}

export interface BotDecision {
  actionType: ActionType;
  amount?: number;
  thinkingDelayMs: number;
}

export interface PreflopRangeQuery {
  position: Position;
  scenario: PreflopScenario;
  raiserPosition?: Position;
}

export interface PostflopQuery {
  boardTexture: BoardTexture;
  street: Street;
  position: RelativePosition;
  sprRange: SPRRange;
  handCategory: HandCategory;
}

export interface EVEstimate {
  evDifferenceBB: number;
  rating: GTORating;
  isApproximate: boolean;
}

export type PreflopRangeMatrix = RangeCell[][];

export {
  type Position,
  type BotStyle,
  type ActionType,
  type Street,
  type Card,
  type HandCategory,
  type BoardTexture,
  type RelativePosition,
  type SPRRange,
  type PreflopScenario,
  type RangeCell,
  type PostflopStrategyRecommendation,
  type GTORating,
};
