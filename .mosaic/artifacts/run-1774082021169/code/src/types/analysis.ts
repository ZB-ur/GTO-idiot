import type { ActionType, Position, Street } from './game';
import type { GTORecommendation } from './gto';

/** GTO alignment quality rating */
export type DecisionQuality = 'good' | 'minor_deviation' | 'major_deviation';

/** Analysis of a single user decision point */
export interface DecisionPointAnalysis {
  readonly frameIndex: number;
  readonly street: Street;
  readonly position?: Position;
  readonly potAtDecision?: number;
  readonly stackAtDecision?: number;
  readonly userAction: {
    readonly action: ActionType;
    readonly amount?: number;
  };
  readonly gtoRecommendations: readonly GTORecommendation[];
  readonly quality: DecisionQuality;
  readonly evDifference: number;
  readonly explanation?: string;
}

/** Full GTO analysis of a completed hand */
export interface HandAnalysis {
  readonly handId: string;
  readonly decisionPoints: readonly DecisionPointAnalysis[];
  readonly overallScore: number;
  readonly totalEVLoss?: number;
  readonly summary?: string;
}

/** A single leak identified in play */
export interface LeakEntry {
  readonly frameIndex: number;
  readonly street: Street;
  readonly context?: string;
  readonly leakType: string;
  readonly evLoss: number;
  readonly description: string;
  readonly suggestion: string;
}

/** Leak analysis for a hand */
export interface LeakAnalysis {
  readonly handId: string;
  readonly leaks: readonly LeakEntry[];
}

/** Decision quality color mapping for UI */
export const QUALITY_COLORS: Record<DecisionQuality, string> = {
  good: 'text-green-400',
  minor_deviation: 'text-yellow-400',
  major_deviation: 'text-red-400',
} as const;

/** Decision quality labels for UI */
export const QUALITY_LABELS: Record<DecisionQuality, string> = {
  good: 'Good',
  minor_deviation: 'Minor Deviation',
  major_deviation: 'Major Deviation',
} as const;
