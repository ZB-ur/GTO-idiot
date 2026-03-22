import type { Position } from './poker';

export type PreflopScenario = 'open' | 'vs_raise' | 'vs_3bet' | 'vs_4bet';

export type PreflopAction = 'fold' | 'call' | 'raise' | 'all_in';

export interface PreflopActionEntry {
  action: PreflopAction;
  frequency: number;
  sizing?: string;
}

export interface PreflopCell {
  hand: string;
  actions: PreflopActionEntry[];
  primaryAction?: PreflopAction;
  colorCode?: string;
}

export interface PreflopChart {
  position: Position;
  scenario: PreflopScenario;
  matrix: PreflopCell[][];
  disclaimer: string;
}

export type BoardTexture =
  | 'high_rainbow_disconnected'
  | 'high_rainbow_connected'
  | 'high_monotone'
  | 'high_twotone_disconnected'
  | 'high_twotone_connected'
  | 'low_rainbow_disconnected'
  | 'low_rainbow_connected'
  | 'low_monotone'
  | 'low_twotone_disconnected'
  | 'low_twotone_connected'
  | 'mixed_rainbow'
  | 'mixed_twotone'
  | 'mixed_monotone';

export type HandStrengthTier = 'nuts' | 'strong' | 'medium' | 'weak' | 'air';

export type PostflopAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'bet_small'
  | 'bet_medium'
  | 'bet_big'
  | 'raise'
  | 'all_in';

export interface PostflopRecommendation {
  primaryAction: PostflopAction;
  frequency?: number;
  sizing?: string;
  alternativeAction?: PostflopAction;
  alternativeFrequency?: number;
  explanation?: string;
}

export interface PostflopGuide {
  boardTexture: BoardTexture;
  handStrength: HandStrengthTier;
  street: 'flop' | 'turn' | 'river';
  isInPosition: boolean;
  recommendation: PostflopRecommendation;
  disclaimer: string;
}

export interface AllPreflopCharts {
  charts: Record<string, PreflopChart>;
}

export interface AllPostflopGuides {
  guides: PostflopGuide[];
}
