import type { ActionType } from './game';
import type { HoleCards, Card } from './card';
import type { Position, Street, ActionEntry } from './game';

/** GTO action recommendation */
export interface GTORecommendation {
  readonly action: ActionType;
  readonly frequency: number;
  readonly betSize?: string;
  readonly betAmount?: number;
  readonly ev?: number;
}

/** Preflop action context */
export type FacingAction = 'unopened' | 'facing_raise' | 'facing_3bet' | 'facing_4bet';

/** Preflop GTO lookup result */
export interface PreflopGTOResult {
  readonly position: Position;
  readonly holeCards: string;
  readonly facingAction: FacingAction;
  readonly recommendations: readonly GTORecommendation[];
  readonly handCategory?: string;
  readonly inRange?: boolean;
}

/** Postflop GTO query request */
export interface PostflopGTORequest {
  readonly holeCards: HoleCards;
  readonly communityCards: readonly Card[];
  readonly street: Street;
  readonly position: Position;
  readonly pot: number;
  readonly effectiveStack: number;
  readonly facingAction: 'none' | 'bet' | 'raise';
  readonly facingAmount?: number;
  readonly actionHistory?: readonly ActionEntry[];
}

/** Hand equity bucket classification */
export type EquityBucket = 'strong' | 'medium' | 'weak' | 'draw';

/** Board texture classification */
export type BoardTexture = 'dry' | 'wet' | 'paired' | 'monotone' | 'connected';

/** Postflop GTO heuristic result */
export interface PostflopGTOResult {
  readonly equityBucket: EquityBucket;
  readonly equity?: number;
  readonly boardTexture: BoardTexture;
  readonly potOdds?: number;
  readonly recommendations: readonly GTORecommendation[];
}
