import type {
  GTOLookupRequest,
  GTORecommendation,
  PreflopHandStrategy,
  PostflopStrategyData,
  Position,
  BoardTexture,
  Street,
  Card,
  ActionEvent,
  StrategyAction,
} from '../types';
import { loadPreflopData, getPreflopData } from './preflop-data';
import { loadPostflopData } from './postflop-loader';
import { classifyBoard } from './board-classifier';

/**
 * Convert two hole cards into standard hand notation (e.g. "AKs", "QJo", "TT").
 */
function holeCardsToNotation(cards: Card[]): string {
  if (cards.length !== 2) return '';

  const rankOrder = 'AKQJT98765432';
  const r1 = cards[0].rank;
  const r2 = cards[1].rank;
  const idx1 = rankOrder.indexOf(r1);
  const idx2 = rankOrder.indexOf(r2);

  // Ensure higher rank comes first
  const high = idx1 <= idx2 ? r1 : r2;
  const low = idx1 <= idx2 ? r2 : r1;

  if (high === low) {
    return `${high}${low}`;
  }

  const suited = cards[0].suit === cards[1].suit;
  return `${high}${low}${suited ? 's' : 'o'}`;
}

/**
 * Classify the preflop scenario from the action history.
 */
function classifyPreflopScenario(
  position: Position,
  actionHistory?: ActionEvent[],
): string {
  if (!actionHistory || actionHistory.length === 0) {
    return 'RFI';
  }

  const preflopActions = actionHistory.filter((a) => a.street === 'preflop');

  // Count raises (excluding blinds)
  const raises = preflopActions.filter(
    (a) => a.action === 'raise' || a.action === 'all_in',
  );
  const calls = preflopActions.filter((a) => a.action === 'call');

  if (raises.length === 0) {
    // No raises yet — this is RFI opportunity
    if (position === 'SB') return 'sb_vs_bb';
    return 'RFI';
  }

  if (raises.length === 1 && calls.length === 0) {
    // Facing a single open raise
    if (position === 'BB' && raises[0].position === 'SB') return 'bb_vs_sb';
    return 'vs_open';
  }

  if (raises.length === 1 && calls.length >= 1) {
    // Open + cold call = squeeze spot
    return 'squeeze';
  }

  if (raises.length === 2) {
    // Facing a 3-bet
    return 'vs_3bet';
  }

  if (raises.length >= 3) {
    // Facing a 4-bet+
    return 'vs_4bet';
  }

  return 'RFI';
}

/**
 * Classify the postflop scenario from position context and action history.
 */
function classifyPostflopScenario(
  position: Position,
  street: Street,
  actionHistory?: ActionEvent[],
): string {
  if (!actionHistory || actionHistory.length === 0) {
    // No actions on this street yet
    // Determine if we're in position or out of position based on typical scenarios
    return 'ip_vs_oop';
  }

  const streetActions = actionHistory.filter((a) => a.street === street);

  // Check if there was a preflop raiser (potential c-bettor)
  const preflopRaises = (actionHistory || []).filter(
    (a) => a.street === 'preflop' && (a.action === 'raise' || a.action === 'all_in'),
  );
  const lastPreflopRaiser = preflopRaises.length > 0 ? preflopRaises[preflopRaises.length - 1] : null;

  if (streetActions.length === 0 && lastPreflopRaiser) {
    // First to act on this street
    if (lastPreflopRaiser.position === position) {
      return 'cbet';
    }
    return 'oop_vs_ip';
  }

  // Check if someone checked to us
  const allChecks = streetActions.every((a) => a.action === 'check');
  if (allChecks && streetActions.length > 0) {
    return 'probe';
  }

  // If there was a bet and we're facing it
  const bets = streetActions.filter(
    (a) => a.action === 'raise' || a.action === 'call',
  );
  if (bets.length > 0) {
    // Check if someone bet into the preflop raiser (donk bet scenario)
    if (lastPreflopRaiser && bets[0].position !== lastPreflopRaiser.position) {
      return 'donk';
    }
    return 'check_raise';
  }

  // Default based on rough position logic
  const latePositions: Position[] = ['CO', 'BTN'];
  return latePositions.includes(position) ? 'ip_vs_oop' : 'oop_vs_ip';
}

/**
 * Categorize a hand relative to the board for postflop strategy lookup.
 * This is a simplified heuristic — a production solver would be more precise.
 */
function categorizeHandVsBoard(
  holeCards: Card[],
  communityCards: Card[],
): string {
  if (holeCards.length !== 2 || communityCards.length < 3) return 'air';

  const rankValues: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  const allCards = [...holeCards, ...communityCards];
  const boardRanks = communityCards.map((c) => rankValues[c.rank]).sort((a, b) => b - a);
  const holeRanks = holeCards.map((c) => rankValues[c.rank]).sort((a, b) => b - a);
  const holeSuits = holeCards.map((c) => c.suit);

  // Count suits across all cards for flush detection
  const suitCounts: Record<string, number> = {};
  for (const c of allCards) {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  }

  // Count ranks across all cards for pair/set detection
  const rankCounts: Record<number, number> = {};
  for (const c of allCards) {
    const v = rankValues[c.rank];
    rankCounts[v] = (rankCounts[v] || 0) + 1;
  }

  // Check for flush (5+ cards of same suit, must use at least one hole card)
  for (const suit of holeSuits) {
    if (suitCounts[suit] && suitCounts[suit] >= 5) {
      return 'made_flush';
    }
  }

  // Check for straights (simplified: check if 5 consecutive values exist using hole cards)
  const allValues = [...new Set(allCards.map((c) => rankValues[c.rank]))].sort((a, b) => a - b);
  // Add ace-low
  if (allValues.includes(14)) allValues.unshift(1);
  for (let i = 0; i <= allValues.length - 5; i++) {
    if (allValues[i + 4] - allValues[i] === 4) {
      // Check if at least one hole card contributes
      const straightValues = new Set<number>();
      for (let j = i; j < i + 5; j++) straightValues.add(allValues[j]);
      const holeContributes = holeRanks.some((r) => straightValues.has(r) || (r === 14 && straightValues.has(1)));
      if (holeContributes) return 'made_straight';
    }
  }

  // Check for sets, two pair, pairs
  const holePaired = holeRanks[0] === holeRanks[1];

  // Four of a kind or set
  for (const [rankStr, count] of Object.entries(rankCounts)) {
    const rank = Number(rankStr);
    if (count >= 3 && holeRanks.includes(rank)) {
      if (count === 4) return 'set'; // technically quads but treat as strong
      return 'set';
    }
  }

  // Two pair (using at least one hole card)
  const pairsUsingHole: number[] = [];
  for (const [rankStr, count] of Object.entries(rankCounts)) {
    const rank = Number(rankStr);
    if (count >= 2 && holeRanks.includes(rank)) {
      pairsUsingHole.push(rank);
    }
  }
  if (pairsUsingHole.length >= 2) return 'two_pair';

  // Pair detection
  if (pairsUsingHole.length === 1) {
    const pairedRank = pairsUsingHole[0];
    if (holePaired && pairedRank > boardRanks[0]) {
      return 'overpair';
    }
    if (pairedRank === boardRanks[0]) {
      // Top pair
      const kicker = holeRanks.find((r) => r !== pairedRank) ?? 0;
      return kicker >= 12 ? 'top_pair_top_kicker' : kicker >= 9 ? 'top_pair' : 'weak_top_pair';
    }
    if (boardRanks.length >= 2 && pairedRank === boardRanks[1]) return 'middle_pair';
    return 'bottom_pair';
  }

  // Draw detection
  // Flush draw (4 cards of same suit using hole card)
  for (const suit of holeSuits) {
    if (suitCounts[suit] && suitCounts[suit] === 4) {
      // Check for combo draw (flush draw + straight draw)
      if (hasOpenEndedStraightDraw(holeRanks, boardRanks)) return 'combo_draw';
      return 'flush_draw';
    }
  }

  // Straight draws
  if (hasOpenEndedStraightDraw(holeRanks, boardRanks)) return 'open_ended_straight_draw';
  if (hasGutshot(holeRanks, boardRanks)) return 'gutshot';

  return 'air';
}

function hasOpenEndedStraightDraw(holeRanks: number[], boardRanks: number[]): boolean {
  const allRanks = [...new Set([...holeRanks, ...boardRanks])].sort((a, b) => a - b);
  if (allRanks.includes(14)) allRanks.unshift(1);

  // Check for 4 consecutive cards where at least one is a hole card
  for (let i = 0; i <= allRanks.length - 4; i++) {
    if (allRanks[i + 3] - allRanks[i] === 3) {
      const window = new Set<number>();
      for (let j = i; j < i + 4; j++) window.add(allRanks[j]);
      // Open-ended: can complete on both ends
      const low = allRanks[i];
      const high = allRanks[i + 3];
      if (low > 1 && high < 14) {
        if (holeRanks.some((r) => window.has(r) || (r === 14 && window.has(1)))) {
          return true;
        }
      }
    }
  }
  return false;
}

function hasGutshot(holeRanks: number[], boardRanks: number[]): boolean {
  const allRanks = [...new Set([...holeRanks, ...boardRanks])].sort((a, b) => a - b);
  if (allRanks.includes(14)) allRanks.unshift(1);

  // Check for 4 out of 5 consecutive with one gap, using at least one hole card
  for (let start = 1; start <= 10; start++) {
    const window = [start, start + 1, start + 2, start + 3, start + 4];
    const present = window.filter((v) => allRanks.includes(v));
    if (present.length === 4) {
      if (holeRanks.some((r) => present.includes(r) || (r === 14 && present.includes(1)))) {
        return true;
      }
    }
  }
  return false;
}

export class GTOService {
  async init(): Promise<void> {
    await loadPreflopData();
  }

  /**
   * Get preflop strategy data for a given position and scenario.
   * Returns the array of PreflopHandStrategy (169 hands with action distributions).
   */
  getPreflopStrategy(position: Position, scenario: string): PreflopHandStrategy[] {
    const data = getPreflopData();
    if (!data) return [];

    const positionData = data.positions[position];
    if (!positionData) return [];

    const scenarioData = positionData[scenario];
    if (!scenarioData) return [];

    return scenarioData;
  }

  /**
   * Get postflop strategy data for a board texture, street, and optional scenario.
   */
  async getPostflopStrategy(
    boardTexture: BoardTexture,
    street: Street,
    _scenario?: string,
  ): Promise<PostflopStrategyData> {
    return loadPostflopData(boardTexture, street);
  }

  /**
   * Lookup GTO recommendation for a specific game situation.
   * Combines preflop tables and postflop generation to produce contextual advice.
   */
  lookup(request: GTOLookupRequest): GTORecommendation {
    const { holeCards, position, street, communityCards, actionHistory } = request;

    if (street === 'preflop') {
      return this.lookupPreflop(holeCards, position, actionHistory);
    }

    return this.lookupPostflop(holeCards, position, street, communityCards || [], actionHistory);
  }

  private lookupPreflop(
    holeCards: Card[],
    position: Position,
    actionHistory?: ActionEvent[],
  ): GTORecommendation {
    const handNotation = holeCardsToNotation(holeCards);
    if (!handNotation) {
      return {
        actions: [{ action: 'fold', frequency: 1.0 }],
        scenario: 'unknown',
        explanation: 'Unable to classify hand.',
      };
    }

    const scenario = classifyPreflopScenario(position, actionHistory);
    const strategies = this.getPreflopStrategy(position, scenario);
    const handStrategy = strategies.find((s) => s.hand === handNotation);

    if (!handStrategy) {
      return {
        actions: [{ action: 'fold', frequency: 1.0 }],
        scenario,
        explanation: `No GTO data found for ${handNotation} at ${position} in ${scenario} scenario.`,
      };
    }

    const primaryAction = handStrategy.actions.reduce(
      (best, curr) => (curr.frequency > best.frequency ? curr : best),
      handStrategy.actions[0],
    );

    const explanation = buildPreflopExplanation(handNotation, position, scenario, primaryAction);

    return {
      actions: handStrategy.actions,
      scenario,
      explanation,
    };
  }

  private lookupPostflop(
    holeCards: Card[],
    position: Position,
    street: Street,
    communityCards: Card[],
    actionHistory?: ActionEvent[],
  ): GTORecommendation {
    const boardTexture = classifyBoard(communityCards);
    const handCategory = categorizeHandVsBoard(holeCards, communityCards);
    const scenario = classifyPostflopScenario(position, street, actionHistory);

    // Synchronous lookup from cache — the caller should have loaded postflop data already
    // If not cached, we generate a reasonable default
    const cacheKey = `${boardTexture}_${street}`;
    // We can't await here since lookup is sync, so use generated data directly
    const strategies = generatePostflopFallback(handCategory, boardTexture, street, scenario);

    const handNotation = holeCardsToNotation(holeCards);
    const primaryAction = strategies.reduce(
      (best, curr) => (curr.frequency > best.frequency ? curr : best),
      strategies[0],
    );

    const explanation = buildPostflopExplanation(
      handNotation,
      handCategory,
      position,
      street,
      boardTexture,
      scenario,
      primaryAction,
    );

    return {
      actions: strategies,
      scenario: `${scenario}_${handCategory}`,
      explanation,
    };
  }

  classifyBoard = classifyBoard;
}

/**
 * Generate postflop strategy actions for a given hand category and context.
 * Used as a synchronous fallback when cached data isn't available.
 */
function generatePostflopFallback(
  handCategory: string,
  boardTexture: BoardTexture,
  street: Street,
  scenario: string,
): StrategyAction[] {
  const isWet = boardTexture.includes('wet');
  const isMonotone = boardTexture.includes('monotone');
  const isFlop = street === 'flop';
  const isIP = scenario.startsWith('ip') || scenario === 'cbet';

  switch (handCategory) {
    case 'overpair':
    case 'set':
    case 'two_pair':
      if (isIP) {
        const betFreq = isWet ? 0.8 : 0.65;
        return [
          { action: isWet ? 'bet_66' : 'bet_33', frequency: betFreq, sizing: isWet ? '2/3 pot' : '1/3 pot' },
          { action: 'check', frequency: round(1 - betFreq) },
        ];
      }
      return [
        { action: 'check_raise', frequency: 0.35 },
        { action: 'call', frequency: 0.55 },
        { action: 'check', frequency: 0.1 },
      ];

    case 'top_pair_top_kicker':
    case 'top_pair':
      if (isIP) {
        const betFreq = isFlop ? 0.7 : 0.55;
        return [
          { action: isFlop ? 'bet_33' : 'bet_66', frequency: betFreq, sizing: isFlop ? '1/3 pot' : '2/3 pot' },
          { action: 'check', frequency: round(1 - betFreq) },
        ];
      }
      return [
        { action: 'call', frequency: 0.6 },
        { action: 'check_raise', frequency: isWet ? 0.2 : 0.1 },
        { action: 'check', frequency: 0.2 },
        { action: 'fold', frequency: 0.1 },
      ];

    case 'weak_top_pair':
    case 'middle_pair':
      if (isIP) {
        return [
          { action: 'bet_33', frequency: isFlop ? 0.45 : 0.3, sizing: '1/3 pot' },
          { action: 'check', frequency: isFlop ? 0.55 : 0.7 },
        ];
      }
      return [
        { action: 'call', frequency: 0.5 },
        { action: 'check', frequency: 0.3 },
        { action: 'fold', frequency: 0.2 },
      ];

    case 'bottom_pair':
      return [
        { action: 'check', frequency: 0.6 },
        { action: 'call', frequency: isFlop ? 0.25 : 0.15 },
        { action: 'fold', frequency: isFlop ? 0.15 : 0.25 },
      ];

    case 'made_flush':
    case 'made_straight':
      if (isIP) {
        return [
          { action: 'bet_75', frequency: 0.5, sizing: '3/4 pot' },
          { action: 'bet_33', frequency: 0.15, sizing: '1/3 pot' },
          { action: 'check', frequency: 0.35 },
        ];
      }
      return [
        { action: 'check_raise', frequency: 0.45 },
        { action: 'call', frequency: 0.35 },
        { action: 'check', frequency: 0.2 },
      ];

    case 'combo_draw':
      if (isIP) {
        return [
          { action: 'bet_66', frequency: isFlop ? 0.65 : 0.45, sizing: '2/3 pot' },
          { action: 'check', frequency: isFlop ? 0.35 : 0.55 },
        ];
      }
      return [
        { action: 'check_raise', frequency: isFlop ? 0.35 : 0.2 },
        { action: 'call', frequency: 0.45 },
        { action: 'fold', frequency: 0.2 },
      ];

    case 'flush_draw':
      if (isMonotone) {
        return [
          { action: 'check', frequency: 0.6 },
          { action: 'bet_33', frequency: 0.2, sizing: '1/3 pot' },
          { action: 'fold', frequency: 0.2 },
        ];
      }
      if (isIP) {
        return [
          { action: 'bet_66', frequency: isFlop ? 0.5 : 0.3, sizing: '2/3 pot' },
          { action: 'check', frequency: isFlop ? 0.5 : 0.7 },
        ];
      }
      return [
        { action: 'call', frequency: isFlop ? 0.6 : 0.45 },
        { action: 'check_raise', frequency: isFlop ? 0.15 : 0.1 },
        { action: 'fold', frequency: isFlop ? 0.25 : 0.45 },
      ];

    case 'open_ended_straight_draw':
      if (isIP) {
        return [
          { action: 'bet_50', frequency: isFlop ? 0.45 : 0.25, sizing: '1/2 pot' },
          { action: 'check', frequency: isFlop ? 0.55 : 0.75 },
        ];
      }
      return [
        { action: 'call', frequency: isFlop ? 0.55 : 0.4 },
        { action: 'check_raise', frequency: 0.1 },
        { action: 'fold', frequency: isFlop ? 0.35 : 0.5 },
      ];

    case 'gutshot':
      if (isIP) {
        return [
          { action: 'bet_33', frequency: isFlop ? 0.35 : 0.15, sizing: '1/3 pot' },
          { action: 'check', frequency: isFlop ? 0.65 : 0.85 },
        ];
      }
      return [
        { action: 'call', frequency: isFlop ? 0.4 : 0.2 },
        { action: 'fold', frequency: isFlop ? 0.6 : 0.8 },
      ];

    case 'air':
    default:
      if (isIP && isFlop) {
        const bluffFreq = isWet ? 0.25 : 0.4;
        return [
          { action: 'bet_33', frequency: bluffFreq, sizing: '1/3 pot' },
          { action: 'check', frequency: round(1 - bluffFreq) },
        ];
      }
      return [
        { action: 'check', frequency: 0.8 },
        { action: 'fold', frequency: 0.15 },
        { action: 'bet_66', frequency: 0.05, sizing: '2/3 pot' },
      ];
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildPreflopExplanation(
  hand: string,
  position: Position,
  scenario: string,
  primaryAction: StrategyAction,
): string {
  const scenarioLabels: Record<string, string> = {
    RFI: 'raise first in',
    vs_open: 'facing an open raise',
    vs_3bet: 'facing a 3-bet',
    vs_4bet: 'facing a 4-bet',
    sb_vs_bb: 'small blind vs big blind',
    bb_vs_sb: 'big blind vs small blind open',
    squeeze: 'squeeze spot (vs open + cold call)',
  };

  const scenarioDesc = scenarioLabels[scenario] || scenario;
  const actionDesc = primaryAction.action.replace(/_/g, ' ');
  const freqPct = Math.round(primaryAction.frequency * 100);

  return `From ${position} in a ${scenarioDesc} spot, GTO recommends ${actionDesc} with ${hand} at ${freqPct}% frequency.`;
}

function buildPostflopExplanation(
  hand: string,
  handCategory: string,
  position: Position,
  street: Street,
  boardTexture: BoardTexture,
  scenario: string,
  primaryAction: StrategyAction,
): string {
  const categoryLabels: Record<string, string> = {
    overpair: 'an overpair',
    set: 'a set',
    two_pair: 'two pair',
    top_pair_top_kicker: 'top pair with top kicker',
    top_pair: 'top pair',
    weak_top_pair: 'weak top pair',
    middle_pair: 'middle pair',
    bottom_pair: 'bottom pair',
    made_flush: 'a made flush',
    made_straight: 'a made straight',
    combo_draw: 'a combo draw',
    flush_draw: 'a flush draw',
    open_ended_straight_draw: 'an open-ended straight draw',
    gutshot: 'a gutshot straight draw',
    air: 'no made hand or significant draw',
  };

  const textureDesc = boardTexture.replace(/_/g, ' ');
  const categoryDesc = categoryLabels[handCategory] || handCategory;
  const actionDesc = primaryAction.action.replace(/_/g, ' ');
  const freqPct = Math.round(primaryAction.frequency * 100);

  return `On a ${textureDesc} board on the ${street}, holding ${hand} (${categoryDesc}) from ${position}, GTO recommends ${actionDesc} at ${freqPct}% frequency.`;
}

export const gtoService = new GTOService();
