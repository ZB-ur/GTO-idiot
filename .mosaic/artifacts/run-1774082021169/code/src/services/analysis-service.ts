/**
 * Analysis service — GTO comparison and leak detection for completed hands.
 * Compares user decisions against GTO recommendations and computes EV differences.
 */

import type { Card } from '../types/card';
import type {
  ActionEntry,
  HandRecord,
  Position,
  Street,
} from '../types/game';
import type { DecisionQuality, DecisionPointAnalysis, HandAnalysis, LeakEntry, LeakAnalysis } from '../types/analysis';
import type { GTORecommendation } from '../types/gto';
import { toCanonicalNotation, classifyHand } from '../engine/gto/preflop-ranges';
import { getHandRecord } from './hand-recorder';

/**
 * Get full GTO analysis for a completed hand.
 */
export async function getHandAnalysis(handId: string): Promise<HandAnalysis | undefined> {
  const record = await getHandRecord(handId);
  if (!record) return undefined;

  const userPlayer = record.players.find(p => p.isUser);
  if (!userPlayer) {
    return { handId, decisionPoints: [], overallScore: 100 };
  }

  const decisionPoints = analyzeDecisionPoints(record, userPlayer.playerId);

  const totalEVLoss = decisionPoints.reduce((sum, dp) => sum + Math.abs(Math.min(0, dp.evDifference)), 0);
  const overallScore = computeOverallScore(decisionPoints);

  const summary = generateSummary(decisionPoints, totalEVLoss);

  return {
    handId,
    decisionPoints,
    overallScore: Math.round(overallScore * 10) / 10,
    totalEVLoss: Math.round(totalEVLoss * 100) / 100,
    summary,
  };
}

/**
 * Get leak analysis for a hand (top 5 leaks by EV loss).
 */
export async function getHandLeaks(handId: string): Promise<LeakAnalysis | undefined> {
  const analysis = await getHandAnalysis(handId);
  if (!analysis) return undefined;

  const leaks: LeakEntry[] = analysis.decisionPoints
    .filter(dp => dp.quality !== 'good' && dp.evDifference < 0)
    .map(dp => ({
      frameIndex: dp.frameIndex,
      street: dp.street,
      context: buildLeakContext(dp),
      leakType: classifyLeak(dp),
      evLoss: Math.round(Math.abs(dp.evDifference) * 100) / 100,
      description: dp.explanation ?? `${dp.quality === 'major_deviation' ? 'Major' : 'Minor'} deviation from GTO`,
      suggestion: generateSuggestion(dp),
    }))
    .sort((a, b) => b.evLoss - a.evLoss)
    .slice(0, 5);

  return { handId, leaks };
}

// ─── Decision point analysis ─────────────────────────────────────────

function analyzeDecisionPoints(record: HandRecord, userId: string): DecisionPointAnalysis[] {
  const points: DecisionPointAnalysis[] = [];
  let frameIndex = 2; // skip deal + blinds

  const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];
  const userPlayer = record.players.find(p => p.playerId === userId);
  if (!userPlayer) return [];

  let runningPot = 0;
  // Compute initial pot from blinds
  const preflopActions = record.actionsByStreet.preflop ?? [];
  for (const a of preflopActions.slice(0, 2)) {
    runningPot += a.amount ?? 0;
  }

  for (const street of streets) {
    const actions = record.actionsByStreet[street] ?? [];
    const voluntaryActions = street === 'preflop' ? actions.slice(2) : actions;

    for (const action of voluntaryActions) {
      if (action.playerId === userId) {
        const gtoRecs = getGTORecommendations(
          record, street, userId, runningPot, frameIndex,
        );

        const evDifference = computeEVDifference(action, gtoRecs);
        const quality = classifyQuality(evDifference, action, gtoRecs);

        points.push({
          frameIndex,
          street,
          position: userPlayer.position,
          potAtDecision: Math.round(runningPot * 100) / 100,
          stackAtDecision: userPlayer.startingStack, // simplified
          userAction: {
            action: action.action,
            amount: action.amount,
          },
          gtoRecommendations: gtoRecs,
          quality,
          evDifference: Math.round(evDifference * 100) / 100,
          explanation: buildExplanation(action, gtoRecs, quality),
        });
      }

      runningPot = action.potAfterAction ?? runningPot;
      frameIndex++;
    }

    // Account for deal frame
    if (street !== 'preflop') {
      frameIndex++; // deal frame
    }
  }

  return points;
}

/**
 * Get GTO recommendations for a decision point.
 * Uses preflop range data for preflop; simplified heuristics for postflop.
 */
function getGTORecommendations(
  record: HandRecord,
  street: Street,
  userId: string,
  pot: number,
  _frameIndex: number,
): GTORecommendation[] {
  const userPlayer = record.players.find(p => p.playerId === userId);
  if (!userPlayer?.holeCards) return [];

  if (street === 'preflop') {
    return getPreflopGTORecommendations(record, userPlayer.position, userPlayer.holeCards);
  }

  return getPostflopGTORecommendations(record, street, pot);
}

function getPreflopGTORecommendations(
  record: HandRecord,
  _position: Position,
  holeCards: { card1: Card; card2: Card },
): GTORecommendation[] {
  const notation = toCanonicalNotation(holeCards);
  const category = classifyHand(notation);

  // Simplified GTO preflop ranges based on position and hand strength
  const isPremium = category === 'Premium';
  const isStrong = category === 'Strong Broadway' || category === 'Medium Pair';

  // Count raises before user
  const preflopActions = record.actionsByStreet.preflop ?? [];
  const raiseCount = preflopActions.filter(a => a.action === 'raise' || a.action === 'all_in').length;

  if (raiseCount === 0) {
    // Unopened pot
    if (isPremium) {
      return [
        { action: 'raise', frequency: 1.0, betSize: '2.5-3BB', ev: 0.5 },
      ];
    }
    if (isStrong) {
      return [
        { action: 'raise', frequency: 0.85, betSize: '2.5BB', ev: 0.2 },
        { action: 'fold', frequency: 0.15 },
      ];
    }
    return [
      { action: 'raise', frequency: 0.3, betSize: '2.5BB', ev: 0.05 },
      { action: 'fold', frequency: 0.7 },
    ];
  }

  // Facing raises
  if (isPremium) {
    return [
      { action: 'raise', frequency: 0.8, betSize: '3x', ev: 0.8 },
      { action: 'call', frequency: 0.2 },
    ];
  }
  if (isStrong) {
    return [
      { action: 'call', frequency: 0.6, ev: 0.1 },
      { action: 'raise', frequency: 0.2, betSize: '3x' },
      { action: 'fold', frequency: 0.2 },
    ];
  }
  return [
    { action: 'fold', frequency: 0.7 },
    { action: 'call', frequency: 0.3 },
  ];
}

function getPostflopGTORecommendations(
  _record: HandRecord,
  street: Street,
  _pot: number,
): GTORecommendation[] {
  // Simplified postflop GTO heuristics
  // In a real implementation, this would use equity calculations
  const sizings: Record<Street, string> = {
    preflop: '2.5BB',
    flop: '33% pot',
    turn: '66% pot',
    river: '75% pot',
  };

  return [
    { action: 'check', frequency: 0.45 },
    { action: 'raise', frequency: 0.35, betSize: sizings[street], ev: 0 },
    { action: 'fold', frequency: 0.2 },
  ];
}

// ─── EV and quality computation ──────────────────────────────────────

function computeEVDifference(action: ActionEntry, gtoRecs: GTORecommendation[]): number {
  if (gtoRecs.length === 0) return 0;

  // Find matching GTO recommendation
  const matching = gtoRecs.find(r => r.action === action.action);

  if (matching && matching.frequency >= 0.3) {
    // Action is in GTO range with reasonable frequency — small or no EV loss
    return matching.ev ?? 0;
  }

  if (matching && matching.frequency > 0) {
    // Action is in range but not primary
    return -0.2; // Minor EV loss
  }

  // Action is not recommended by GTO at all
  const bestEV = Math.max(...gtoRecs.map(r => r.ev ?? 0));
  return -(bestEV + 0.5); // Significant EV loss
}

function classifyQuality(
  evDifference: number,
  action: ActionEntry,
  gtoRecs: GTORecommendation[],
): DecisionQuality {
  const matching = gtoRecs.find(r => r.action === action.action);

  if (matching && matching.frequency >= 0.3) {
    return 'good';
  }

  if (Math.abs(evDifference) < 0.5) {
    return 'minor_deviation';
  }

  return 'major_deviation';
}

// ─── Explanation and leak classification ─────────────────────────────

function buildExplanation(
  action: ActionEntry,
  gtoRecs: GTORecommendation[],
  quality: DecisionQuality,
): string {
  if (quality === 'good') {
    return 'Action aligns with GTO strategy.';
  }

  const primary = gtoRecs[0];
  if (!primary) return '';

  const matching = gtoRecs.find(r => r.action === action.action);
  if (matching && quality === 'minor_deviation') {
    return `${action.action} is in the GTO range (${Math.round(matching.frequency * 100)}% frequency), but the primary recommendation is ${primary.action}.`;
  }

  return `GTO recommends ${primary.action} (${Math.round(primary.frequency * 100)}% frequency), but you chose ${action.action}.`;
}

function buildLeakContext(dp: DecisionPointAnalysis): string {
  const primary = dp.gtoRecommendations[0];
  if (!primary) return '';

  const actionStr = dp.userAction.amount
    ? `${dp.userAction.action} ${dp.userAction.amount}BB`
    : dp.userAction.action;

  const gtoStr = primary.betSize
    ? `${primary.action} ${primary.betSize}`
    : primary.action;

  return `${dp.street}: ${actionStr} -> should ${gtoStr}`;
}

function classifyLeak(dp: DecisionPointAnalysis): string {
  const primary = dp.gtoRecommendations[0];
  if (!primary) return 'unknown';

  const userAction = dp.userAction.action;

  if (userAction === 'fold' && primary.action !== 'fold') {
    if (dp.street === 'preflop') return 'Folding too tight preflop';
    return `Over-folding on ${dp.street}`;
  }

  if (userAction === 'call' && primary.action === 'raise') {
    return 'Passive play — should raise for value';
  }

  if (userAction === 'raise' && primary.action === 'fold') {
    return `Bluffing too aggressively on ${dp.street}`;
  }

  if (userAction === 'raise' && primary.action === 'call') {
    return 'Over-aggression — flat call preferred';
  }

  if (userAction === 'check' && primary.action === 'raise') {
    return 'Missing value bet opportunity';
  }

  return 'Suboptimal action selection';
}

function generateSuggestion(dp: DecisionPointAnalysis): string {
  const primary = dp.gtoRecommendations[0];
  if (!primary) return '';

  const leakType = classifyLeak(dp);

  switch (leakType) {
    case 'Folding too tight preflop':
      return 'Consider defending wider in this position. Review your preflop ranges.';
    case 'Passive play — should raise for value':
      return 'When you have a strong hand, raise for value instead of calling. This extracts more from opponents.';
    case 'Missing value bet opportunity':
      return 'Consider betting for value when checked to with a strong hand. Missing value bets is a common leak.';
    default:
      return `GTO recommends ${primary.action}${primary.betSize ? ` (${primary.betSize})` : ''} in this spot with ${Math.round(primary.frequency * 100)}% frequency.`;
  }
}

function computeOverallScore(points: DecisionPointAnalysis[]): number {
  if (points.length === 0) return 100;

  let score = 100;
  for (const dp of points) {
    switch (dp.quality) {
      case 'good':
        break; // No penalty
      case 'minor_deviation':
        score -= 5;
        break;
      case 'major_deviation':
        score -= 15;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function generateSummary(points: DecisionPointAnalysis[], totalEVLoss: number): string {
  if (points.length === 0) return 'No decisions to analyze.';

  const goodCount = points.filter(p => p.quality === 'good').length;
  const total = points.length;
  const pct = Math.round((goodCount / total) * 100);

  if (pct >= 80) {
    return `Solid play — ${goodCount}/${total} decisions aligned with GTO. Total EV loss: ${totalEVLoss.toFixed(2)} BB.`;
  }
  if (pct >= 50) {
    return `Mixed results — ${goodCount}/${total} GTO-aligned decisions. Review your ${points.find(p => p.quality === 'major_deviation')?.street ?? ''} play. EV loss: ${totalEVLoss.toFixed(2)} BB.`;
  }
  return `Significant deviations from GTO — only ${goodCount}/${total} aligned. Total EV loss: ${totalEVLoss.toFixed(2)} BB. Focus on the biggest leaks.`;
}
