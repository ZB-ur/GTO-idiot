import type {
  GTOComplianceReport,
  HandHistoryPage,
  Street,
  WeaknessItem,
  HandRecord,
} from '../types';
import { historyService } from './history-service';
import { replayService } from './replay-service';

interface DecisionPoint {
  handId: string;
  street: Street;
  scenario: string;
  decisionType: string;
  isMatch: boolean;
  compliance: number;
}

export class ReportService {
  async generateReport(
    handCount: number = 100,
    dateRange?: { from: string; to: string }
  ): Promise<GTOComplianceReport> {
    // Fetch recent hands
    const filter = {
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
      sortBy: 'date_desc' as const,
    };
    const page = await historyService.getHands(filter, 1, handCount);
    const hands = page.items;

    if (hands.length === 0) {
      return {
        handsAnalyzed: 0,
        dateRange,
        overallCompliance: 0,
        totalDecisionPoints: 0,
        byStreet: [],
        byDecisionType: [],
        topWeaknesses: [],
      };
    }

    // Collect all decision points by replaying each hand
    const allDecisions: DecisionPoint[] = [];
    const handRecords: HandRecord[] = [];

    for (const summary of hands) {
      const replay = await replayService.getReplay(summary.handId);
      if (!replay) continue;

      handRecords.push(replay.handRecord);

      for (const street of replay.streets) {
        for (const action of street.actions) {
          if (!action.isPlayerAction || !action.gtoAnalysis) continue;

          const isMatch = action.gtoAnalysis.deviation === 'match';
          const freq = action.gtoAnalysis.actualActionFrequency ?? 0;

          allDecisions.push({
            handId: summary.handId,
            street: street.street,
            scenario: action.gtoAnalysis.scenario ?? 'unknown',
            decisionType: action.gtoAnalysis.scenario ?? 'unknown',
            isMatch,
            compliance: freq,
          });
        }
      }
    }

    const totalDecisionPoints = allDecisions.length;
    const matchCount = allDecisions.filter((d) => d.isMatch).length;
    const overallCompliance =
      totalDecisionPoints > 0 ? matchCount / totalDecisionPoints : 0;

    // Per-street breakdown
    const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const byStreet = streets
      .map((street) => {
        const streetDecisions = allDecisions.filter(
          (d) => d.street === street
        );
        const count = streetDecisions.length;
        if (count === 0) return null;
        const matches = streetDecisions.filter((d) => d.isMatch).length;
        return {
          street,
          compliance: Math.round((matches / count) * 100) / 100,
          decisionCount: count,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // Per-decision-type breakdown
    const decisionTypes = new Map<
      string,
      { matches: number; total: number }
    >();
    for (const d of allDecisions) {
      const entry = decisionTypes.get(d.decisionType) ?? {
        matches: 0,
        total: 0,
      };
      entry.total++;
      if (d.isMatch) entry.matches++;
      decisionTypes.set(d.decisionType, entry);
    }

    const byDecisionType = Array.from(decisionTypes.entries())
      .map(([decisionType, { matches, total }]) => ({
        decisionType,
        compliance: Math.round((matches / total) * 100) / 100,
        decisionCount: total,
      }))
      .sort((a, b) => a.compliance - b.compliance);

    // Top 5 weaknesses — group by scenario, find lowest compliance
    const scenarioGroups = new Map<
      string,
      { matches: number; total: number; handIds: Set<string> }
    >();
    for (const d of allDecisions) {
      const key = `${d.street}_${d.scenario}`;
      const entry = scenarioGroups.get(key) ?? {
        matches: 0,
        total: 0,
        handIds: new Set<string>(),
      };
      entry.total++;
      if (d.isMatch) entry.matches++;
      entry.handIds.add(d.handId);
      scenarioGroups.set(key, entry);
    }

    const weaknesses: WeaknessItem[] = Array.from(scenarioGroups.entries())
      .filter(([, v]) => v.total >= 2) // need at least 2 occurrences
      .map(([key, v]) => {
        const [street, ...scenarioParts] = key.split('_');
        const scenario = scenarioParts.join('_');
        const compliance = v.matches / v.total;
        return {
          weaknessId: key,
          scenario: `${street}: ${this.formatScenario(scenario)}`,
          compliance: Math.round(compliance * 100) / 100,
          occurrences: v.total,
          suggestion: this.generateSuggestion(
            street as Street,
            scenario,
            compliance
          ),
          relatedHandCount: v.handIds.size,
        };
      })
      .sort((a, b) => a.compliance - b.compliance)
      .slice(0, 5);

    return {
      handsAnalyzed: hands.length,
      dateRange,
      overallCompliance: Math.round(overallCompliance * 100) / 100,
      totalDecisionPoints,
      byStreet,
      byDecisionType,
      topWeaknesses: weaknesses,
    };
  }

  async getWeaknessHands(
    weaknessId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<HandHistoryPage> {
    // Parse weaknessId to extract street and scenario
    const [street, ...scenarioParts] = weaknessId.split('_');
    const scenario = scenarioParts.join('_');

    // Get all hands and filter for those matching this weakness
    const allHands = await historyService.getHands(
      { sortBy: 'date_desc' },
      1,
      1000
    );

    const matchingHandIds: string[] = [];

    for (const summary of allHands.items) {
      const replay = await replayService.getReplay(summary.handId);
      if (!replay) continue;

      const hasWeakness = replay.streets.some(
        (s) =>
          s.street === street &&
          s.actions.some(
            (a) =>
              a.isPlayerAction &&
              a.gtoAnalysis?.scenario === scenario &&
              a.gtoAnalysis.deviation !== 'match'
          )
      );

      if (hasWeakness) {
        matchingHandIds.push(summary.handId);
      }
    }

    const total = matchingHandIds.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const pagedIds = matchingHandIds.slice(start, start + pageSize);

    // Get the summaries for the paged IDs
    const items = allHands.items.filter((h) => pagedIds.includes(h.handId));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  private formatScenario(scenario: string): string {
    const labels: Record<string, string> = {
      open_raise: 'Open Raise decisions',
      '3bet': '3-Bet decisions',
      '4bet': '4-Bet decisions',
      cold_call: 'Cold Call decisions',
      cbet: 'Continuation Bet decisions',
      probe: 'Probe Bet decisions',
      check_raise: 'Check-Raise decisions',
      facing_bet: 'Facing Bet decisions',
      fold_to_bet: 'Fold to Bet decisions',
    };
    return labels[scenario] ?? `${scenario} decisions`;
  }

  private generateSuggestion(
    street: Street,
    scenario: string,
    compliance: number
  ): string {
    const isVeryLow = compliance < 0.3;
    const streetLabel = street.charAt(0).toUpperCase() + street.slice(1);

    const suggestions: Record<string, string> = {
      open_raise: isVeryLow
        ? `Review your ${streetLabel} opening ranges. You may be opening too tight or too loose from certain positions.`
        : `Fine-tune your ${streetLabel} open-raise sizing and frequency to better match GTO ranges.`,
      '3bet': isVeryLow
        ? `Study 3-betting ranges for ${streetLabel}. Focus on balancing value 3-bets with bluff 3-bets.`
        : `Adjust your 3-bet frequency on ${streetLabel} to include more balanced bluff combos.`,
      '4bet': isVeryLow
        ? `Your 4-bet strategy on ${streetLabel} needs significant improvement. Review which hands to 4-bet for value vs bluff.`
        : `Refine your 4-bet ranges to include a balanced mix of premium hands and blockers.`,
      cbet: isVeryLow
        ? `Your ${streetLabel} c-bet strategy deviates significantly from GTO. Study board texture-dependent c-bet frequencies.`
        : `Adjust your ${streetLabel} c-bet sizing and frequency based on board texture.`,
      check_raise: isVeryLow
        ? `Incorporate more check-raises on ${streetLabel}. A balanced check-raise range is essential for GTO play.`
        : `Fine-tune your ${streetLabel} check-raise frequency and hand selection.`,
      facing_bet: isVeryLow
        ? `Review how you respond to bets on ${streetLabel}. Your fold/call/raise ratios may be unbalanced.`
        : `Consider adjusting your defense frequency when facing bets on ${streetLabel}.`,
      fold_to_bet: isVeryLow
        ? `You may be folding too often to bets on ${streetLabel}. Review your continuing range.`
        : `Balance your folding frequency on ${streetLabel} to avoid being exploitable.`,
      probe: isVeryLow
        ? `Study probe betting spots on ${streetLabel}. These are valuable opportunities when the preflop aggressor checks.`
        : `Refine your probe bet sizing and frequency on ${streetLabel}.`,
    };

    return (
      suggestions[scenario] ??
      `Review your ${scenario} strategy on ${streetLabel} and compare with GTO recommendations.`
    );
  }
}

export const reportService = new ReportService();
