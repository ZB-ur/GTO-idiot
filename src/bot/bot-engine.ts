/**
 * BOT decision-making engine.
 *
 * - Preflop: looks up GTO charts (loaded from public/data/preflop-charts.json)
 *   and uses frequency-weighted randomisation for mixed strategies.
 * - Postflop: classifies board texture + hand strength, consults simplified
 *   postflop guides, and maps the recommended PostflopAction to a concrete
 *   PlayerAction with appropriate sizing.
 * - Includes randomization jitter on bet sizing so bots don't always bet
 *   perfectly round amounts.
 */

import type {
  Card,
  Player,
  PlayerAction,
  Position,
  Street,
  BlindStructure,
  PreflopChart,
  PreflopCell,
  PreflopAction,
  PreflopScenario,
  PostflopGuide,
  PostflopAction,
  BoardTexture,
  HandStrengthTier,
  AllPreflopCharts,
  AllPostflopGuides,
} from '../types';
import { evaluateHand, HandRank, type EvaluatedHand, rankValue } from '../engine';

// ─── GTO Data Cache ──────────────────────────────────────────────

let preflopCharts: Record<string, PreflopChart> | null = null;
let postflopGuides: PostflopGuide[] | null = null;

/**
 * Initialise (or re-initialise) the GTO lookup tables.
 * Must be called once before any bot decisions are made.
 * In a browser context the data is fetched from /data/*.json.
 */
export async function loadGTOData(): Promise<void> {
  try {
    const [pfRes, postRes] = await Promise.all([
      fetch('/data/preflop-charts.json'),
      fetch('/data/postflop-guides.json'),
    ]);
    if (pfRes.ok) {
      const data: AllPreflopCharts = await pfRes.json();
      preflopCharts = data.charts;
    }
    if (postRes.ok) {
      const data: AllPostflopGuides = await postRes.json();
      postflopGuides = data.guides;
    }
  } catch {
    // Gracefully degrade – the bot will fall back to heuristic play
    console.warn('[BotEngine] Failed to load GTO data; falling back to heuristic strategy.');
  }
}

/**
 * Allow injection of pre-loaded data (useful for tests / SSR).
 */
export function setGTOData(
  charts: Record<string, PreflopChart> | null,
  guides: PostflopGuide[] | null,
): void {
  preflopCharts = charts;
  postflopGuides = guides;
}

/**
 * Check whether GTO data has been loaded.
 */
export function isGTODataLoaded(): boolean {
  return preflopCharts !== null || postflopGuides !== null;
}

// ─── Public API ──────────────────────────────────────────────────

export interface BotDecisionContext {
  /** The bot player who must act. */
  player: Player;
  /** All players at the table (for position / action analysis). */
  players: Player[];
  /** Current street. */
  street: Street;
  /** Community cards dealt so far. */
  communityCards: Card[];
  /** Current highest bet in this betting round. */
  currentBet: number;
  /** Total pot (including current round bets). */
  potSize: number;
  /** Blind structure. */
  blinds: BlindStructure;
  /** Dealer index (to derive relative position). */
  dealerIndex: number;
  /** Preflop action history summary (for scenario detection). */
  preflopRaiseCount: number;
}

/**
 * Decide the best action for a BOT player.
 * Returns a PlayerAction that can be fed directly into GameEngine.submitAction().
 */
export function decideBotAction(ctx: BotDecisionContext): PlayerAction {
  if (!ctx.player.holeCards) {
    return { actionType: 'fold' };
  }

  if (ctx.street === 'preflop') {
    return preflopDecision(ctx);
  }
  return postflopDecision(ctx);
}

// ─── Preflop Decision ────────────────────────────────────────────

function preflopDecision(ctx: BotDecisionContext): PlayerAction {
  const { player, currentBet, blinds, preflopRaiseCount } = ctx;
  const cards = player.holeCards!;
  const amountToCall = currentBet - player.currentBet;

  // Determine scenario
  const scenario = detectPreflopScenario(preflopRaiseCount);

  // Try GTO lookup first
  const gtoAction = lookupPreflopGTO(cards, player.position, scenario);
  if (gtoAction) {
    return mapPreflopAction(gtoAction, amountToCall, currentBet, player, blinds);
  }

  // Fallback: heuristic preflop
  return heuristicPreflop(cards, amountToCall, currentBet, player, blinds);
}

function detectPreflopScenario(raiseCount: number): PreflopScenario {
  if (raiseCount === 0) return 'open';
  if (raiseCount === 1) return 'vs_raise';
  if (raiseCount === 2) return 'vs_3bet';
  return 'vs_4bet';
}

/**
 * Look up the GTO preflop chart and select an action using
 * frequency-weighted randomisation.
 */
function lookupPreflopGTO(
  holeCards: [Card, Card],
  position: Position,
  scenario: PreflopScenario,
): PreflopAction | null {
  if (!preflopCharts) return null;

  const key = `${position}_${scenario}`;
  const chart = preflopCharts[key];
  if (!chart?.matrix) return null;

  const notation = handNotation(holeCards);
  const cell = findCellInMatrix(chart.matrix, notation);
  if (!cell || cell.actions.length === 0) return null;

  // Weighted random selection across mixed-strategy frequencies
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of cell.actions) {
    cumulative += entry.frequency;
    if (roll < cumulative) {
      return entry.action;
    }
  }

  // Edge case – return the primary action
  return cell.primaryAction ?? cell.actions[0].action;
}

/** Convert two hole cards to standard notation e.g. "AKs", "QJo", "TT". */
function handNotation(cards: [Card, Card]): string {
  const [a, b] = cards;
  const va = rankValue(a.rank);
  const vb = rankValue(b.rank);

  const high = va >= vb ? a : b;
  const low = va >= vb ? b : a;

  if (high.rank === low.rank) return `${high.rank}${low.rank}`;
  const suited = high.suit === low.suit ? 's' : 'o';
  return `${high.rank}${low.rank}${suited}`;
}

/** Search a 13×13 matrix for a cell matching the given hand notation. */
function findCellInMatrix(matrix: PreflopCell[][], notation: string): PreflopCell | null {
  for (const row of matrix) {
    for (const cell of row) {
      if (cell.hand === notation) return cell;
    }
  }
  return null;
}

/** Convert a GTO PreflopAction into a concrete PlayerAction. */
function mapPreflopAction(
  action: PreflopAction,
  amountToCall: number,
  currentBet: number,
  player: Player,
  blinds: BlindStructure,
): PlayerAction {
  switch (action) {
    case 'fold':
      // Never fold if we can check
      if (amountToCall === 0) return { actionType: 'check' };
      return { actionType: 'fold' };

    case 'call':
      if (amountToCall === 0) return { actionType: 'check' };
      if (amountToCall > player.chipStack) {
        return { actionType: 'all_in' };
      }
      return { actionType: 'call' };

    case 'raise': {
      // Standard open-raise sizing: 2.5BB; 3-bet: ~3× previous raise
      // Add slight randomization (+/- 10%) so bots aren't perfectly predictable
      const jitter = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
      const raiseSize = currentBet === blinds.bigBlind
        ? blinds.bigBlind * 2.5 * jitter
        : currentBet * 2.5 * jitter;
      const totalAmount = Math.min(
        Math.round(raiseSize * 100) / 100,
        player.chipStack + player.currentBet,
      );
      if (totalAmount >= player.chipStack + player.currentBet) {
        return { actionType: 'all_in' };
      }
      return { actionType: 'raise', amount: totalAmount };
    }

    case 'all_in':
      return { actionType: 'all_in' };
  }
}

/** Heuristic preflop strategy when GTO data is unavailable. */
function heuristicPreflop(
  cards: [Card, Card],
  amountToCall: number,
  currentBet: number,
  player: Player,
  blinds: BlindStructure,
): PlayerAction {
  const isPair = cards[0].rank === cards[1].rank;
  const highCards = cards.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank)).length;
  const isSuited = cards[0].suit === cards[1].suit;
  const rand = Math.random();

  // Premium hands (pairs, two broadway, suited broadway) – raise
  if (isPair || highCards === 2 || (highCards === 1 && isSuited)) {
    if (rand < 0.35 && amountToCall <= blinds.bigBlind * 6) {
      const jitter = 0.9 + Math.random() * 0.2;
      const raiseAmount = currentBet + blinds.bigBlind * 2.5 * jitter;
      return {
        actionType: 'raise',
        amount: Math.min(
          Math.round(raiseAmount * 100) / 100,
          player.chipStack + player.currentBet,
        ),
      };
    }
    if (amountToCall <= player.chipStack) return { actionType: 'call' };
  }

  // Playable hands – call small bets
  if (highCards >= 1 || isSuited) {
    if (amountToCall <= blinds.bigBlind * 3 && amountToCall <= player.chipStack) {
      return { actionType: 'call' };
    }
  }

  // Free check
  if (amountToCall === 0) return { actionType: 'check' };

  // Occasional bluff call
  if (rand < 0.1 && amountToCall <= blinds.bigBlind * 2) {
    return { actionType: 'call' };
  }

  return { actionType: 'fold' };
}

// ─── Postflop Decision ───────────────────────────────────────────

function postflopDecision(ctx: BotDecisionContext): PlayerAction {
  const { player, communityCards, currentBet, potSize, blinds, players, dealerIndex } = ctx;
  const cards = player.holeCards!;
  const amountToCall = currentBet - player.currentBet;

  const evaluated = evaluateHand(cards, communityCards);
  const tier = classifyHandStrength(evaluated);
  const boardTex = classifyBoardTexture(communityCards);
  const inPosition = isInPosition(player, players, dealerIndex);
  const street = ctx.street as 'flop' | 'turn' | 'river';

  // Try GTO guide lookup
  const guide = lookupPostflopGuide(boardTex, tier, street, inPosition);
  if (guide) {
    return mapPostflopAction(
      guide,
      amountToCall,
      potSize,
      player,
      blinds,
    );
  }

  // Fallback heuristic
  return heuristicPostflop(evaluated, amountToCall, potSize, player, blinds);
}

function lookupPostflopGuide(
  boardTexture: BoardTexture,
  handStrength: HandStrengthTier,
  street: 'flop' | 'turn' | 'river',
  inPosition: boolean,
): PostflopGuide | null {
  if (!postflopGuides) return null;

  // Exact match first
  let guide = postflopGuides.find(
    g =>
      g.boardTexture === boardTexture &&
      g.handStrength === handStrength &&
      g.street === street &&
      g.isInPosition === inPosition,
  );
  if (guide) return guide;

  // Relax position requirement
  guide = postflopGuides.find(
    g =>
      g.boardTexture === boardTexture &&
      g.handStrength === handStrength &&
      g.street === street,
  );
  return guide ?? null;
}

/** Map a PostflopAction recommendation to a concrete PlayerAction with sizing. */
function mapPostflopAction(
  guide: PostflopGuide,
  amountToCall: number,
  potSize: number,
  player: Player,
  blinds: BlindStructure,
): PlayerAction {
  const rec = guide.recommendation;

  // Mixed strategy: with alternativeAction, randomise
  if (rec.alternativeAction && rec.frequency != null && rec.alternativeFrequency != null) {
    const roll = Math.random();
    const action = roll < rec.frequency ? rec.primaryAction : rec.alternativeAction;
    return resolvePostflopAction(action, amountToCall, potSize, player, blinds, rec.sizing);
  }

  return resolvePostflopAction(rec.primaryAction, amountToCall, potSize, player, blinds, rec.sizing);
}

function resolvePostflopAction(
  action: PostflopAction,
  amountToCall: number,
  potSize: number,
  player: Player,
  blinds: BlindStructure,
  _sizing?: string,
): PlayerAction {
  switch (action) {
    case 'fold':
      if (amountToCall === 0) return { actionType: 'check' };
      return { actionType: 'fold' };

    case 'check':
      if (amountToCall > 0) {
        // Can't check when facing a bet — fall back to call or fold
        return amountToCall <= potSize * 0.4
          ? { actionType: 'call' }
          : { actionType: 'fold' };
      }
      return { actionType: 'check' };

    case 'call':
      if (amountToCall === 0) return { actionType: 'check' };
      if (amountToCall > player.chipStack) return { actionType: 'all_in' };
      return { actionType: 'call' };

    case 'bet_small': {
      if (amountToCall > 0) return { actionType: 'call' };
      const amount = computeBetSize(0.33, potSize, player, blinds);
      return { actionType: 'bet', amount };
    }

    case 'bet_medium': {
      if (amountToCall > 0) {
        return resolveRaise(2.5, amountToCall, player);
      }
      const amount = computeBetSize(0.66, potSize, player, blinds);
      return { actionType: 'bet', amount };
    }

    case 'bet_big': {
      if (amountToCall > 0) {
        return resolveRaise(3.0, amountToCall, player);
      }
      const amount = computeBetSize(1.0, potSize, player, blinds);
      return { actionType: 'bet', amount };
    }

    case 'raise': {
      if (amountToCall === 0) {
        const amount = computeBetSize(0.75, potSize, player, blinds);
        return { actionType: 'bet', amount };
      }
      return resolveRaise(2.5, amountToCall, player);
    }

    case 'all_in':
      return { actionType: 'all_in' };
  }
}

function computeBetSize(
  potFraction: number,
  potSize: number,
  player: Player,
  blinds: BlindStructure,
): number {
  // Add slight jitter (+/- 5%) to prevent perfectly predictable sizing
  const jitter = 0.95 + Math.random() * 0.1;
  const raw = Math.round(potSize * potFraction * jitter * 100) / 100;
  const clamped = Math.max(raw, blinds.bigBlind);
  return Math.min(clamped, player.chipStack);
}

function resolveRaise(multiplier: number, amountToCall: number, player: Player): PlayerAction {
  const jitter = 0.95 + Math.random() * 0.1;
  const raiseTotal = Math.round(amountToCall * multiplier * jitter * 100) / 100 + player.currentBet;
  if (raiseTotal >= player.chipStack + player.currentBet) {
    return { actionType: 'all_in' };
  }
  return { actionType: 'raise', amount: raiseTotal };
}

/** Heuristic postflop fallback. */
function heuristicPostflop(
  hand: EvaluatedHand,
  amountToCall: number,
  potSize: number,
  player: Player,
  blinds: BlindStructure,
): PlayerAction {
  const rand = Math.random();

  // Strong (two pair+)
  if (hand.rank >= HandRank.TwoPair) {
    if (amountToCall === 0) {
      const betSize = Math.round(potSize * (0.5 + rand * 0.5));
      return { actionType: 'bet', amount: Math.min(Math.max(betSize, blinds.bigBlind), player.chipStack) };
    }
    if (rand < 0.3 && amountToCall < player.chipStack * 0.5) {
      const raiseAmount = amountToCall * 2.5 + player.currentBet;
      return { actionType: 'raise', amount: Math.min(raiseAmount, player.chipStack + player.currentBet) };
    }
    return { actionType: 'call' };
  }

  // Medium (one pair)
  if (hand.rank === HandRank.OnePair) {
    if (amountToCall === 0) {
      if (rand < 0.3) {
        const betSize = Math.round(potSize * 0.33);
        return { actionType: 'bet', amount: Math.min(Math.max(betSize, blinds.bigBlind), player.chipStack) };
      }
      return { actionType: 'check' };
    }
    if (amountToCall <= potSize * 0.5) return { actionType: 'call' };
    return rand < 0.2 ? { actionType: 'call' } : { actionType: 'fold' };
  }

  // Weak / air
  if (amountToCall === 0) {
    // Occasional bluff bet with air
    if (rand < 0.12) {
      const betSize = Math.round(potSize * 0.33);
      return { actionType: 'bet', amount: Math.min(Math.max(betSize, blinds.bigBlind), player.chipStack) };
    }
    return { actionType: 'check' };
  }
  if (rand < 0.08) return { actionType: 'call' }; // bluff call
  return { actionType: 'fold' };
}

// ─── Board Texture Classification ────────────────────────────────

export function classifyBoardTexture(communityCards: Card[]): BoardTexture {
  if (communityCards.length === 0) return 'mixed_rainbow';

  // Height
  const values = communityCards.map(c => rankValue(c.rank));
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const height: 'high' | 'low' | 'mixed' =
    avgValue >= 10 ? 'high' : avgValue <= 7 ? 'low' : 'mixed';

  // Flush draw
  const suitCounts = new Map<string, number>();
  for (const c of communityCards) {
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }
  const maxSuitCount = Math.max(...suitCounts.values());
  const flushDraw: 'rainbow' | 'twotone' | 'monotone' =
    maxSuitCount >= 3 ? 'monotone' : maxSuitCount === 2 ? 'twotone' : 'rainbow';

  // Connectivity
  const sorted = [...values].sort((a, b) => a - b);
  let connected = false;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] <= 2) {
      connected = true;
      break;
    }
  }

  // Build key — some textures don't have connected/disconnected variants
  if (flushDraw === 'monotone') {
    return `${height}_monotone` as BoardTexture;
  }
  const connectivity = connected ? 'connected' : 'disconnected';
  return `${height}_${flushDraw}_${connectivity}` as BoardTexture;
}

// ─── Hand Strength Tier ──────────────────────────────────────────

export function classifyHandStrength(hand: EvaluatedHand): HandStrengthTier {
  switch (hand.rank) {
    case HandRank.RoyalFlush:
    case HandRank.StraightFlush:
    case HandRank.FourOfAKind:
    case HandRank.FullHouse:
    case HandRank.Flush:
    case HandRank.Straight:
    case HandRank.ThreeOfAKind:
      return 'nuts';

    case HandRank.TwoPair:
      return 'strong';

    case HandRank.OnePair:
      // Top pair → medium; lower pairs → weak
      return hand.kickers[0] >= 10 ? 'medium' : 'weak';

    case HandRank.HighCard:
    default:
      return 'air';
  }
}

// ─── Position Helper ─────────────────────────────────────────────

function isInPosition(player: Player, players: Player[], dealerIndex: number): boolean {
  const n = players.length;
  const playerIdx = players.indexOf(player);
  const offset = (playerIdx - dealerIndex + n) % n;
  // BTN (0) and CO (5) are "in position" in most postflop scenarios
  return offset === 0 || offset >= 4;
}

// ─── Exported Utilities (for testing / review service) ───────────

export { handNotation };
