import type { PreflopStrategyTable, PreflopHandStrategy, StrategyAction, Position } from '../types';

let preflopData: PreflopStrategyTable | null = null;

/**
 * All 169 unique starting hands in standard notation.
 */
function generate169Hands(): string[] {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hands: string[] = [];
  for (let i = 0; i < ranks.length; i++) {
    // Pairs
    hands.push(`${ranks[i]}${ranks[i]}`);
    for (let j = i + 1; j < ranks.length; j++) {
      hands.push(`${ranks[i]}${ranks[j]}s`); // suited
      hands.push(`${ranks[i]}${ranks[j]}o`); // offsuit
    }
  }
  return hands;
}

const ALL_HANDS = generate169Hands();

/**
 * Hand strength tiers for classifying starting hands.
 * Returns a value 0-100 representing relative hand strength.
 */
function handStrength(hand: string): number {
  const ranks = 'AKQJT98765432';
  const r1 = ranks.indexOf(hand[0]);
  const r2 = ranks.indexOf(hand[1]);
  const isPair = hand.length === 2 || (hand.length === 3 && hand[0] === hand[1]);
  const isSuited = hand.endsWith('s');

  if (isPair) {
    // AA=100, KK=95, QQ=90, ..., 22=40
    return 100 - r1 * 5;
  }

  // Base strength from card ranks (lower index = higher rank)
  const base = 85 - r1 * 3 - r2 * 2;
  const suitBonus = isSuited ? 6 : 0;
  const gapPenalty = (r2 - r1 - 1) * 2;
  const connectedBonus = r2 - r1 === 1 ? 4 : 0;
  const broadwayBonus = r1 <= 4 && r2 <= 4 ? 5 : 0;

  return Math.max(0, Math.min(100, base + suitBonus - gapPenalty + connectedBonus + broadwayBonus));
}

/**
 * Generate RFI (Raise First In) strategy for a hand at a given position.
 */
function generateRFI(hand: string, position: Position): StrategyAction[] {
  const strength = handStrength(hand);

  // Position-based thresholds for opening
  const thresholds: Record<Position, { raiseThresh: number; mixLow: number }> = {
    UTG: { raiseThresh: 58, mixLow: 50 },
    HJ:  { raiseThresh: 50, mixLow: 42 },
    CO:  { raiseThresh: 38, mixLow: 28 },
    BTN: { raiseThresh: 25, mixLow: 12 },
    SB:  { raiseThresh: 30, mixLow: 15 },
    BB:  { raiseThresh: 100, mixLow: 100 }, // BB doesn't RFI
  };

  const { raiseThresh, mixLow } = thresholds[position];

  if (position === 'BB') {
    return [{ action: 'check', frequency: 1.0 }];
  }

  if (strength >= raiseThresh) {
    // Pure raise
    return [{ action: 'raise_2.5x', frequency: 1.0, sizing: '2.5 BB' }];
  } else if (strength >= mixLow) {
    // Mixed strategy
    const raiseFreq = Math.round(((strength - mixLow) / (raiseThresh - mixLow)) * 100) / 100;
    return [
      { action: 'raise_2.5x', frequency: raiseFreq, sizing: '2.5 BB' },
      { action: 'fold', frequency: Math.round((1 - raiseFreq) * 100) / 100 },
    ];
  }
  // Pure fold
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Generate vs_open (facing an open raise) strategy.
 */
function generateVsOpen(hand: string, position: Position): StrategyAction[] {
  const strength = handStrength(hand);

  // Tighter 3-bet ranges from earlier positions
  const thresholds: Record<Position, { threeBetThresh: number; callThresh: number; mixLow: number }> = {
    UTG: { threeBetThresh: 85, callThresh: 65, mixLow: 55 },
    HJ:  { threeBetThresh: 78, callThresh: 58, mixLow: 48 },
    CO:  { threeBetThresh: 72, callThresh: 50, mixLow: 38 },
    BTN: { threeBetThresh: 65, callThresh: 40, mixLow: 25 },
    SB:  { threeBetThresh: 68, callThresh: 50, mixLow: 35 },
    BB:  { threeBetThresh: 70, callThresh: 35, mixLow: 20 },
  };

  const { threeBetThresh, callThresh, mixLow } = thresholds[position];

  if (strength >= threeBetThresh) {
    // Strong 3-bet or sometimes call (slowplay)
    return [
      { action: 'raise_3x', frequency: 0.75, sizing: '3x open' },
      { action: 'call', frequency: 0.25 },
    ];
  } else if (strength >= callThresh) {
    // Calling range
    const threeBetFreq = Math.max(0, (strength - callThresh) / (threeBetThresh - callThresh) * 0.3);
    return [
      { action: 'call', frequency: Math.round((1 - threeBetFreq) * 100) / 100 },
      { action: 'raise_3x', frequency: Math.round(threeBetFreq * 100) / 100, sizing: '3x open' },
    ].filter(a => a.frequency > 0);
  } else if (strength >= mixLow) {
    // Occasional bluff 3-bet or fold
    const callFreq = Math.round(((strength - mixLow) / (callThresh - mixLow)) * 0.5 * 100) / 100;
    return [
      { action: 'fold', frequency: Math.round((1 - callFreq) * 100) / 100 },
      { action: 'call', frequency: callFreq },
    ].filter(a => a.frequency > 0);
  }
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Generate vs_3bet (facing a 3-bet after opening) strategy.
 */
function generateVs3Bet(hand: string, position: Position): StrategyAction[] {
  const strength = handStrength(hand);

  const thresholds: Record<Position, { fourBetThresh: number; callThresh: number }> = {
    UTG: { fourBetThresh: 88, callThresh: 70 },
    HJ:  { fourBetThresh: 85, callThresh: 65 },
    CO:  { fourBetThresh: 80, callThresh: 58 },
    BTN: { fourBetThresh: 75, callThresh: 50 },
    SB:  { fourBetThresh: 78, callThresh: 55 },
    BB:  { fourBetThresh: 82, callThresh: 60 },
  };

  const { fourBetThresh, callThresh } = thresholds[position];

  if (strength >= fourBetThresh) {
    return [
      { action: 'raise_4bet', frequency: 0.8, sizing: '2.5x 3bet' },
      { action: 'call', frequency: 0.2 },
    ];
  } else if (strength >= callThresh) {
    return [
      { action: 'call', frequency: 0.7 },
      { action: 'fold', frequency: 0.3 },
    ];
  }
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Generate SB vs BB (steal/defend) strategy.
 */
function generateSBvsBB(hand: string): StrategyAction[] {
  const strength = handStrength(hand);
  if (strength >= 30) {
    return [{ action: 'raise_2.5x', frequency: 1.0, sizing: '2.5 BB' }];
  } else if (strength >= 15) {
    const raiseFreq = Math.round(((strength - 15) / 15) * 100) / 100;
    return [
      { action: 'raise_2.5x', frequency: raiseFreq, sizing: '2.5 BB' },
      { action: 'fold', frequency: Math.round((1 - raiseFreq) * 100) / 100 },
    ];
  }
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Generate BB vs SB (facing SB open) strategy.
 */
function generateBBvsSB(hand: string): StrategyAction[] {
  const strength = handStrength(hand);
  if (strength >= 75) {
    return [
      { action: 'raise_3x', frequency: 0.7, sizing: '3x' },
      { action: 'call', frequency: 0.3 },
    ];
  } else if (strength >= 35) {
    const threeBetFreq = Math.max(0, Math.round(((strength - 50) / 25) * 0.3 * 100) / 100);
    return [
      { action: 'call', frequency: Math.round((1 - threeBetFreq) * 100) / 100 },
      { action: 'raise_3x', frequency: threeBetFreq, sizing: '3x' },
    ].filter(a => a.frequency > 0);
  } else if (strength >= 15) {
    return [
      { action: 'call', frequency: 0.4 },
      { action: 'fold', frequency: 0.6 },
    ];
  }
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Generate squeeze (3-bet vs open + cold call) strategy.
 */
function generateSqueeze(hand: string, position: Position): StrategyAction[] {
  const strength = handStrength(hand);
  // Squeeze ranges are tighter and more polarized
  const positionBonus = position === 'BTN' || position === 'SB' ? 5 : 0;
  const adjustedStrength = strength + positionBonus;

  if (adjustedStrength >= 80) {
    return [
      { action: 'raise_4x', frequency: 0.85, sizing: '4x open' },
      { action: 'call', frequency: 0.15 },
    ];
  } else if (adjustedStrength >= 60) {
    return [
      { action: 'call', frequency: 0.6 },
      { action: 'fold', frequency: 0.4 },
    ];
  }
  return [{ action: 'fold', frequency: 1.0 }];
}

/**
 * Build the complete preflop strategy table for all positions and scenarios.
 */
function buildPreflopTable(): PreflopStrategyTable {
  const positions: Record<string, Record<string, PreflopHandStrategy[]>> = {};
  const allPositions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  const scenarios = ['RFI', 'vs_open', 'vs_3bet', 'vs_4bet', 'sb_vs_bb', 'bb_vs_sb', 'squeeze'];

  for (const pos of allPositions) {
    positions[pos] = {};
    for (const scenario of scenarios) {
      positions[pos][scenario] = ALL_HANDS.map((hand): PreflopHandStrategy => {
        let actions: StrategyAction[];
        switch (scenario) {
          case 'RFI':
            actions = generateRFI(hand, pos);
            break;
          case 'vs_open':
            actions = generateVsOpen(hand, pos);
            break;
          case 'vs_3bet':
            actions = generateVs3Bet(hand, pos);
            break;
          case 'vs_4bet':
            // vs 4-bet: very tight, mostly premium hands only
            actions = handStrength(hand) >= 90
              ? [{ action: 'all_in', frequency: 0.6 }, { action: 'call', frequency: 0.4 }]
              : handStrength(hand) >= 75
                ? [{ action: 'call', frequency: 0.4 }, { action: 'fold', frequency: 0.6 }]
                : [{ action: 'fold', frequency: 1.0 }];
            break;
          case 'sb_vs_bb':
            actions = pos === 'SB' ? generateSBvsBB(hand) : [{ action: 'fold', frequency: 1.0 }];
            break;
          case 'bb_vs_sb':
            actions = pos === 'BB' ? generateBBvsSB(hand) : [{ action: 'fold', frequency: 1.0 }];
            break;
          case 'squeeze':
            actions = generateSqueeze(hand, pos);
            break;
          default:
            actions = [{ action: 'fold', frequency: 1.0 }];
        }
        return { hand, actions };
      });
    }
  }

  return { positions };
}

/**
 * Load preflop GTO data from the static JSON asset.
 * Falls back to generating data in-memory if the fetch fails.
 */
export async function loadPreflopData(): Promise<PreflopStrategyTable> {
  if (preflopData) return preflopData;

  try {
    const response = await fetch('/data/gto/preflop.json');
    if (response.ok) {
      const json = (await response.json()) as PreflopStrategyTable;
      // Validate that we got real data, not an empty stub
      if (json.positions && Object.keys(json.positions).length > 0) {
        preflopData = json;
        return preflopData;
      }
    }
  } catch {
    // Fetch failed (e.g., SSR, tests) — fall through to generated data
  }

  // Generate comprehensive preflop data in-memory
  preflopData = buildPreflopTable();
  return preflopData;
}

export function getPreflopData(): PreflopStrategyTable | null {
  return preflopData;
}
