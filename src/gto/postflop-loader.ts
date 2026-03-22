import type { PostflopStrategyData, PostflopStrategy, BoardTexture, Street } from '../types';

const cache = new Map<string, PostflopStrategyData>();

/**
 * Hand categories used in postflop strategy data.
 */
const HAND_CATEGORIES = [
  'top_pair', 'overpair', 'middle_pair', 'bottom_pair', 'two_pair',
  'set', 'flush_draw', 'open_ended_straight_draw', 'gutshot',
  'combo_draw', 'made_flush', 'made_straight', 'air',
  'top_pair_top_kicker', 'weak_top_pair',
] as const;

/**
 * Generate GTO-approximate postflop strategy for a given hand category,
 * board texture, street, and scenario.
 */
function generateStrategy(
  category: string,
  texture: BoardTexture,
  street: Street,
  scenario: string,
): PostflopStrategy {
  const isWet = texture.includes('wet');
  const isMonotone = texture.includes('monotone');
  const isHigh = texture.startsWith('high');
  const isFlop = street === 'flop';
  const isTurn = street === 'turn';
  const isIP = scenario.startsWith('ip');
  const isCbet = scenario === 'cbet';

  const actions = buildActions(category, { isWet, isMonotone, isHigh, isFlop, isTurn, isIP, isCbet });

  return { handCategory: category, actions };
}

interface BoardContext {
  isWet: boolean;
  isMonotone: boolean;
  isHigh: boolean;
  isFlop: boolean;
  isTurn: boolean;
  isIP: boolean;
  isCbet: boolean;
}

function buildActions(
  category: string,
  ctx: BoardContext,
): { action: string; frequency: number; sizing?: string }[] {
  switch (category) {
    case 'overpair':
    case 'set':
    case 'two_pair':
      return strongMadeHand(ctx);
    case 'top_pair_top_kicker':
    case 'top_pair':
      return topPairStrategy(ctx);
    case 'weak_top_pair':
    case 'middle_pair':
      return mediumMadeHand(ctx);
    case 'bottom_pair':
      return weakMadeHand(ctx);
    case 'made_flush':
    case 'made_straight':
      return nutHand(ctx);
    case 'combo_draw':
      return comboDrawStrategy(ctx);
    case 'flush_draw':
      return flushDrawStrategy(ctx);
    case 'open_ended_straight_draw':
      return oesdStrategy(ctx);
    case 'gutshot':
      return gutshotStrategy(ctx);
    case 'air':
      return airStrategy(ctx);
    default:
      return [{ action: 'check', frequency: 0.7 }, { action: 'fold', frequency: 0.3 }];
  }
}

function strongMadeHand(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    const betFreq = ctx.isWet ? 0.8 : 0.65;
    const sizing = ctx.isWet ? '2/3 pot' : '1/3 pot';
    return [
      { action: `bet_${ctx.isWet ? '66' : '33'}`, frequency: betFreq, sizing },
      { action: 'check', frequency: round(1 - betFreq) },
    ];
  }
  return [
    { action: 'check_raise', frequency: 0.35 },
    { action: 'call', frequency: 0.55 },
    { action: 'check', frequency: 0.1 },
  ];
}

function topPairStrategy(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    const betFreq = ctx.isFlop ? 0.7 : 0.55;
    const sizing = ctx.isFlop ? '1/3 pot' : '2/3 pot';
    return [
      { action: `bet_${ctx.isFlop ? '33' : '66'}`, frequency: betFreq, sizing },
      { action: 'check', frequency: round(1 - betFreq) },
    ];
  }
  return [
    { action: 'check_raise', frequency: ctx.isWet ? 0.2 : 0.1 },
    { action: 'call', frequency: 0.6 },
    { action: 'check', frequency: 0.2 },
    { action: 'fold', frequency: 0.1 },
  ];
}

function mediumMadeHand(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'bet_33', frequency: ctx.isFlop ? 0.45 : 0.3, sizing: '1/3 pot' },
      { action: 'check', frequency: ctx.isFlop ? 0.55 : 0.7 },
    ];
  }
  return [
    { action: 'call', frequency: 0.5 },
    { action: 'check', frequency: 0.3 },
    { action: 'fold', frequency: 0.2 },
  ];
}

function weakMadeHand(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'check', frequency: 0.75 },
      { action: 'bet_33', frequency: 0.25, sizing: '1/3 pot' },
    ];
  }
  return [
    { action: 'call', frequency: ctx.isFlop ? 0.4 : 0.25 },
    { action: 'fold', frequency: ctx.isFlop ? 0.35 : 0.55 },
    { action: 'check', frequency: ctx.isFlop ? 0.25 : 0.2 },
  ];
}

function nutHand(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
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
}

function comboDrawStrategy(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'bet_66', frequency: ctx.isFlop ? 0.65 : 0.45, sizing: '2/3 pot' },
      { action: 'check', frequency: ctx.isFlop ? 0.35 : 0.55 },
    ];
  }
  return [
    { action: 'check_raise', frequency: ctx.isFlop ? 0.35 : 0.2 },
    { action: 'call', frequency: 0.45 },
    { action: 'check', frequency: 0.1 },
    { action: 'fold', frequency: 0.1 },
  ];
}

function flushDrawStrategy(ctx: BoardContext) {
  if (ctx.isMonotone) {
    // On monotone boards, flush draws are less valuable
    return [
      { action: 'check', frequency: 0.6 },
      { action: 'bet_33', frequency: 0.2, sizing: '1/3 pot' },
      { action: 'fold', frequency: 0.2 },
    ];
  }
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'bet_66', frequency: ctx.isFlop ? 0.5 : 0.3, sizing: '2/3 pot' },
      { action: 'check', frequency: ctx.isFlop ? 0.5 : 0.7 },
    ];
  }
  return [
    { action: 'call', frequency: ctx.isFlop ? 0.6 : 0.45 },
    { action: 'check_raise', frequency: ctx.isFlop ? 0.15 : 0.1 },
    { action: 'fold', frequency: ctx.isFlop ? 0.25 : 0.45 },
  ];
}

function oesdStrategy(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'bet_50', frequency: ctx.isFlop ? 0.45 : 0.25, sizing: '1/2 pot' },
      { action: 'check', frequency: ctx.isFlop ? 0.55 : 0.75 },
    ];
  }
  return [
    { action: 'call', frequency: ctx.isFlop ? 0.55 : 0.4 },
    { action: 'check_raise', frequency: 0.1 },
    { action: 'fold', frequency: ctx.isFlop ? 0.35 : 0.5 },
  ];
}

function gutshotStrategy(ctx: BoardContext) {
  if (ctx.isCbet || ctx.isIP) {
    return [
      { action: 'bet_33', frequency: ctx.isFlop ? 0.35 : 0.15, sizing: '1/3 pot' },
      { action: 'check', frequency: ctx.isFlop ? 0.65 : 0.85 },
    ];
  }
  return [
    { action: 'call', frequency: ctx.isFlop ? 0.4 : 0.2 },
    { action: 'fold', frequency: ctx.isFlop ? 0.6 : 0.8 },
  ];
}

function airStrategy(ctx: BoardContext) {
  if (ctx.isCbet && ctx.isFlop) {
    // C-bet bluffing range
    const bluffFreq = ctx.isWet ? 0.25 : 0.4;
    return [
      { action: 'bet_33', frequency: bluffFreq, sizing: '1/3 pot' },
      { action: 'check', frequency: round(1 - bluffFreq) },
    ];
  }
  if (ctx.isIP && ctx.isFlop) {
    return [
      { action: 'bet_33', frequency: 0.3, sizing: '1/3 pot' },
      { action: 'check', frequency: 0.7 },
    ];
  }
  // Later streets or OOP: mostly give up
  return [
    { action: 'check', frequency: 0.8 },
    { action: 'fold', frequency: 0.15 },
    { action: 'bet_66', frequency: 0.05, sizing: '2/3 pot' },
  ];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

const POSTFLOP_SCENARIOS = ['ip_vs_oop', 'oop_vs_ip', 'cbet', 'check_raise', 'probe', 'donk'] as const;
const POSTFLOP_STREETS: Street[] = ['flop', 'turn', 'river'];

/**
 * Generate a complete postflop strategy dataset for a given board texture and street.
 */
function generatePostflopData(boardTexture: BoardTexture, street: Street): PostflopStrategyData {
  const scenarios: Record<string, PostflopStrategy[]> = {};

  for (const scenario of POSTFLOP_SCENARIOS) {
    scenarios[scenario] = HAND_CATEGORIES.map((cat) =>
      generateStrategy(cat, boardTexture, street, scenario),
    );
  }

  return { boardTexture, street, scenarios };
}

/**
 * Load postflop GTO strategy data for a given board texture and street.
 * Data is generated on demand and cached in memory.
 */
export async function loadPostflopData(
  boardTexture: BoardTexture,
  street: Street,
): Promise<PostflopStrategyData> {
  const key = `${boardTexture}_${street}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // Generate strategy data (simulates lazy loading of chunked JSON)
  const data = generatePostflopData(boardTexture, street);
  cache.set(key, data);
  return data;
}

/**
 * Preload postflop data for common board textures to improve lookup speed.
 */
export async function preloadCommonTextures(): Promise<void> {
  const commonTextures: BoardTexture[] = [
    'high_dry_rainbow', 'high_dry_two_tone',
    'mid_dry_rainbow', 'mid_wet_two_tone',
    'low_dry_rainbow',
  ];
  await Promise.all(
    commonTextures.flatMap((tex) =>
      POSTFLOP_STREETS.map((st) => loadPostflopData(tex, st)),
    ),
  );
}

export function clearPostflopCache(): void {
  cache.clear();
}
