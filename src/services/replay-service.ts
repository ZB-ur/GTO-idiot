import type {
  HandReplay,
  GTOAnalysis,
  ActionType,
  ReplayStreet,
  ReplayAction,
  DeviationSeverity,
  StrategyAction,
  Street,
  Position,
  HandRecord,
} from '../types';
import { historyService } from './history-service';
import { gtoService } from '../gto';

function classifyScenario(
  street: Street,
  position: Position,
  action: ActionType,
  actionIndex: number,
  streetActions: { action: ActionType; playerId: string }[]
): string {
  if (street === 'preflop') {
    const priorRaises = streetActions
      .slice(0, actionIndex)
      .filter((a) => a.action === 'raise');
    if (priorRaises.length === 0) return 'open_raise';
    if (priorRaises.length === 1) return '3bet';
    if (priorRaises.length === 2) return '4bet';
    return 'cold_call';
  }

  // Postflop scenarios
  const priorActions = streetActions.slice(0, actionIndex);
  const hasBet = priorActions.some(
    (a) => a.action === 'raise' || a.action === 'all_in'
  );
  const hasCheck = priorActions.some((a) => a.action === 'check');

  if (!hasBet && !hasCheck) return 'cbet';
  if (hasCheck && !hasBet) return 'probe';
  if (hasBet && action === 'raise') return 'check_raise';
  if (hasBet && action === 'fold') return 'fold_to_bet';
  return 'facing_bet';
}

function computeDeviation(
  actualAction: ActionType,
  recommendedActions: StrategyAction[]
): { severity: DeviationSeverity; frequency: number } {
  if (recommendedActions.length === 0) {
    return { severity: 'match', frequency: 1 };
  }

  // Normalize action names for matching
  const normalizeAction = (a: string): string => {
    if (a.startsWith('raise') || a.startsWith('bet')) return 'raise';
    if (a === 'all_in') return 'raise';
    return a;
  };

  const normalizedActual = normalizeAction(actualAction);
  const matchingRec = recommendedActions.find(
    (r) => normalizeAction(r.action) === normalizedActual
  );

  const frequency = matchingRec?.frequency ?? 0;

  if (frequency >= 0.5) return { severity: 'match', frequency };
  if (frequency >= 0.1) return { severity: 'minor', frequency };
  return { severity: 'major', frequency };
}

function buildExplanation(
  actualAction: ActionType,
  deviation: DeviationSeverity,
  recommended: StrategyAction[],
  scenario: string
): string {
  if (deviation === 'match') {
    return `Your ${actualAction} aligns with GTO strategy in this ${scenario} spot.`;
  }

  const topRec = recommended.reduce<StrategyAction | null>(
    (best, r) => (!best || r.frequency > best.frequency ? r : best),
    null
  );

  if (!topRec) {
    return `Your ${actualAction} deviates from GTO in this ${scenario} spot.`;
  }

  const pct = Math.round(topRec.frequency * 100);
  return `GTO suggests ${topRec.action} ${pct}% here in ${scenario} spots, but you chose to ${actualAction}.`;
}

export class ReplayService {
  async getReplay(handId: string): Promise<HandReplay | null> {
    const record = await historyService.getHandById(handId);
    if (!record) return null;

    const humanPlayer = record.players.find((p) => p.isHuman);
    if (!humanPlayer) return null;

    let totalDecisions = 0;
    let matchCount = 0;

    const replayStreets: ReplayStreet[] = record.streets.map((streetRec) => {
      const actions: ReplayAction[] = streetRec.actions.map((actionEvt, idx) => {
        const isPlayerAction = actionEvt.playerId === humanPlayer.playerId;
        const player = record.players.find(
          (p) => p.playerId === actionEvt.playerId
        );

        let gtoAnalysis: GTOAnalysis | undefined;

        if (isPlayerAction) {
          gtoAnalysis = this.analyzeDecision(
            {
              street: streetRec.street,
              position: humanPlayer.position,
              potSize: streetRec.potAtStart,
              holeCards: humanPlayer.holeCards,
              communityCards: streetRec.communityCards,
              actionIndex: idx,
              streetActions: streetRec.actions.map((a) => ({
                action: a.action,
                playerId: a.playerId,
              })),
            },
            actionEvt.action
          );

          totalDecisions++;
          if (gtoAnalysis.deviation === 'match') matchCount++;
        }

        return {
          playerId: actionEvt.playerId,
          playerName: player?.name ?? actionEvt.playerName,
          position: actionEvt.position,
          action: actionEvt.action,
          amount: actionEvt.amount,
          isPlayerAction,
          gtoAnalysis,
        };
      });

      return {
        street: streetRec.street,
        communityCards: streetRec.communityCards,
        pot: streetRec.potAtEnd ?? streetRec.potAtStart,
        actions,
      };
    });

    const overallCompliance =
      totalDecisions > 0 ? matchCount / totalDecisions : 1;

    return {
      handId: record.handId,
      handRecord: record,
      streets: replayStreets,
      overallCompliance: Math.round(overallCompliance * 100) / 100,
    };
  }

  analyzeDecision(
    situation: {
      street: string;
      position: string;
      potSize: number;
      holeCards?: { rank: string; suit: string }[];
      communityCards?: { rank: string; suit: string }[];
      actionIndex?: number;
      streetActions?: { action: ActionType; playerId: string }[];
    },
    actualAction: ActionType
  ): GTOAnalysis {
    const scenario = classifyScenario(
      situation.street as Street,
      situation.position as Position,
      actualAction,
      situation.actionIndex ?? 0,
      situation.streetActions ?? []
    );

    // Look up GTO recommendation
    const recommendation = gtoService.lookup({
      holeCards: (situation.holeCards ?? []) as HandRecord['players'][0]['holeCards'],
      position: situation.position as Position,
      street: situation.street as Street,
      communityCards: situation.communityCards as HandRecord['players'][0]['holeCards'],
      potSize: situation.potSize,
      scenario,
    });

    const recommendedActions =
      recommendation.actions.length > 0
        ? recommendation.actions
        : this.getFallbackRecommendation(situation.street as Street, scenario);

    const { severity, frequency } = computeDeviation(
      actualAction,
      recommendedActions
    );

    const explanation = buildExplanation(
      actualAction,
      severity,
      recommendedActions,
      scenario
    );

    return {
      deviation: severity,
      actualActionFrequency: Math.round(frequency * 100) / 100,
      recommendedActions,
      explanation,
      scenario,
    };
  }

  private getFallbackRecommendation(
    street: Street,
    scenario: string
  ): StrategyAction[] {
    // Default GTO approximations when no specific data is available
    const defaults: Record<string, StrategyAction[]> = {
      open_raise: [
        { action: 'raise', frequency: 0.6 },
        { action: 'fold', frequency: 0.4 },
      ],
      '3bet': [
        { action: 'raise', frequency: 0.3 },
        { action: 'call', frequency: 0.35 },
        { action: 'fold', frequency: 0.35 },
      ],
      '4bet': [
        { action: 'raise', frequency: 0.15 },
        { action: 'call', frequency: 0.25 },
        { action: 'fold', frequency: 0.6 },
      ],
      cbet: [
        { action: 'raise', frequency: 0.55 },
        { action: 'check', frequency: 0.45 },
      ],
      probe: [
        { action: 'raise', frequency: 0.35 },
        { action: 'check', frequency: 0.65 },
      ],
      check_raise: [
        { action: 'raise', frequency: 0.1 },
        { action: 'call', frequency: 0.45 },
        { action: 'fold', frequency: 0.45 },
      ],
      facing_bet: [
        { action: 'call', frequency: 0.4 },
        { action: 'raise', frequency: 0.15 },
        { action: 'fold', frequency: 0.45 },
      ],
      fold_to_bet: [
        { action: 'call', frequency: 0.45 },
        { action: 'raise', frequency: 0.15 },
        { action: 'fold', frequency: 0.4 },
      ],
    };

    return defaults[scenario] ?? [
      { action: 'check', frequency: 0.5 },
      { action: 'fold', frequency: 0.5 },
    ];
  }
}

export const replayService = new ReplayService();
