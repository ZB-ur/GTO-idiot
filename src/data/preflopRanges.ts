import type { PreflopRangeData, RangeCell, HandType } from '../types';

const RANK_LABELS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function handNotation(row: number, col: number): { hand: string; handType: HandType } {
  if (row === col) return { hand: `${RANK_LABELS[row]}${RANK_LABELS[col]}`, handType: 'pair' };
  if (row < col) return { hand: `${RANK_LABELS[row]}${RANK_LABELS[col]}s`, handType: 'suited' };
  return { hand: `${RANK_LABELS[col]}${RANK_LABELS[row]}o`, handType: 'offsuit' };
}

type ActionFreq = { raise?: number; call?: number; fold?: number };

function buildMatrix(rangeMap: Record<string, ActionFreq>): RangeCell[] {
  const cells: RangeCell[] = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const { hand, handType } = handNotation(row, col);
      const freq = rangeMap[hand];
      const raiseF = freq?.raise ?? 0;
      const callF = freq?.call ?? 0;
      const inRange = raiseF > 0 || callF > 0;
      const actions: RangeCell['actions'] = [];
      if (raiseF > 0) actions.push({ actionType: 'raise', frequency: raiseF });
      if (callF > 0) actions.push({ actionType: 'call', frequency: callF });
      const foldF = 1 - raiseF - callF;
      if (foldF > 0.001 && inRange) actions.push({ actionType: 'fold', frequency: Math.max(0, foldF) });
      if (!inRange) actions.push({ actionType: 'fold', frequency: 1 });
      cells.push({ hand, row, col, handType, inRange, actions, colorIntensity: raiseF + callF });
    }
  }
  return cells;
}

// ──────────────────────────── UTG Open Raise (~15%) ────────────────────────────
const UTG_OPEN: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 1 }, 'JJ': { raise: 1 },
  'TT': { raise: 1 }, '99': { raise: 1 }, '88': { raise: 0.8 }, '77': { raise: 0.6 },
  'AKs': { raise: 1 }, 'AQs': { raise: 1 }, 'AJs': { raise: 1 }, 'ATs': { raise: 0.9 },
  'A5s': { raise: 0.5 }, 'A4s': { raise: 0.4 },
  'KQs': { raise: 1 }, 'KJs': { raise: 0.8 }, 'KTs': { raise: 0.5 },
  'QJs': { raise: 0.7 }, 'QTs': { raise: 0.4 },
  'JTs': { raise: 0.7 }, 'T9s': { raise: 0.3 },
  'AKo': { raise: 1 }, 'AQo': { raise: 1 }, 'AJo': { raise: 0.7 },
  'KQo': { raise: 0.5 },
};

// ──────────────────────────── MP Open Raise (~18%) ────────────────────────────
const MP_OPEN: Record<string, ActionFreq> = {
  ...UTG_OPEN,
  '88': { raise: 1 }, '77': { raise: 0.9 }, '66': { raise: 0.5 },
  'ATs': { raise: 1 }, 'A9s': { raise: 0.5 }, 'A5s': { raise: 0.7 }, 'A4s': { raise: 0.6 },
  'KJs': { raise: 1 }, 'KTs': { raise: 0.8 },
  'QJs': { raise: 0.9 }, 'QTs': { raise: 0.6 },
  'JTs': { raise: 0.9 }, 'T9s': { raise: 0.5 }, '98s': { raise: 0.3 },
  'AJo': { raise: 1 }, 'KQo': { raise: 0.8 }, 'ATo': { raise: 0.4 },
};

// ──────────────────────────── CO Open Raise (~27%) ────────────────────────────
const CO_OPEN: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 1 }, 'JJ': { raise: 1 },
  'TT': { raise: 1 }, '99': { raise: 1 }, '88': { raise: 1 }, '77': { raise: 1 },
  '66': { raise: 0.9 }, '55': { raise: 0.8 }, '44': { raise: 0.5 }, '33': { raise: 0.4 },
  'AKs': { raise: 1 }, 'AQs': { raise: 1 }, 'AJs': { raise: 1 }, 'ATs': { raise: 1 },
  'A9s': { raise: 0.9 }, 'A8s': { raise: 0.7 }, 'A7s': { raise: 0.6 }, 'A6s': { raise: 0.5 },
  'A5s': { raise: 0.9 }, 'A4s': { raise: 0.8 }, 'A3s': { raise: 0.6 }, 'A2s': { raise: 0.4 },
  'KQs': { raise: 1 }, 'KJs': { raise: 1 }, 'KTs': { raise: 1 }, 'K9s': { raise: 0.6 },
  'QJs': { raise: 1 }, 'QTs': { raise: 0.9 }, 'Q9s': { raise: 0.5 },
  'JTs': { raise: 1 }, 'J9s': { raise: 0.7 },
  'T9s': { raise: 0.9 }, 'T8s': { raise: 0.4 },
  '98s': { raise: 0.8 }, '87s': { raise: 0.6 }, '76s': { raise: 0.4 },
  'AKo': { raise: 1 }, 'AQo': { raise: 1 }, 'AJo': { raise: 1 }, 'ATo': { raise: 0.8 },
  'KQo': { raise: 1 }, 'KJo': { raise: 0.7 }, 'KTo': { raise: 0.4 },
  'QJo': { raise: 0.6 }, 'QTo': { raise: 0.3 },
  'JTo': { raise: 0.4 },
};

// ──────────────────────────── BTN Open Raise (~40%) ────────────────────────────
const BTN_OPEN: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 1 }, 'JJ': { raise: 1 },
  'TT': { raise: 1 }, '99': { raise: 1 }, '88': { raise: 1 }, '77': { raise: 1 },
  '66': { raise: 1 }, '55': { raise: 1 }, '44': { raise: 0.9 }, '33': { raise: 0.8 },
  '22': { raise: 0.7 },
  'AKs': { raise: 1 }, 'AQs': { raise: 1 }, 'AJs': { raise: 1 }, 'ATs': { raise: 1 },
  'A9s': { raise: 1 }, 'A8s': { raise: 1 }, 'A7s': { raise: 0.9 }, 'A6s': { raise: 0.8 },
  'A5s': { raise: 1 }, 'A4s': { raise: 1 }, 'A3s': { raise: 0.9 }, 'A2s': { raise: 0.8 },
  'KQs': { raise: 1 }, 'KJs': { raise: 1 }, 'KTs': { raise: 1 }, 'K9s': { raise: 1 },
  'K8s': { raise: 0.7 }, 'K7s': { raise: 0.6 }, 'K6s': { raise: 0.5 }, 'K5s': { raise: 0.4 },
  'QJs': { raise: 1 }, 'QTs': { raise: 1 }, 'Q9s': { raise: 0.9 }, 'Q8s': { raise: 0.5 },
  'JTs': { raise: 1 }, 'J9s': { raise: 1 }, 'J8s': { raise: 0.6 },
  'T9s': { raise: 1 }, 'T8s': { raise: 0.8 }, 'T7s': { raise: 0.3 },
  '98s': { raise: 1 }, '97s': { raise: 0.5 },
  '87s': { raise: 1 }, '86s': { raise: 0.4 },
  '76s': { raise: 0.9 }, '75s': { raise: 0.3 },
  '65s': { raise: 0.8 }, '54s': { raise: 0.6 },
  'AKo': { raise: 1 }, 'AQo': { raise: 1 }, 'AJo': { raise: 1 }, 'ATo': { raise: 1 },
  'A9o': { raise: 0.8 }, 'A8o': { raise: 0.6 }, 'A7o': { raise: 0.4 }, 'A5o': { raise: 0.3 },
  'KQo': { raise: 1 }, 'KJo': { raise: 1 }, 'KTo': { raise: 0.8 }, 'K9o': { raise: 0.4 },
  'QJo': { raise: 0.9 }, 'QTo': { raise: 0.7 },
  'JTo': { raise: 0.8 }, 'J9o': { raise: 0.3 },
  'T9o': { raise: 0.5 },
};

// ──────────────────────────── SB Open Raise (~40%) ────────────────────────────
const SB_OPEN: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 1 }, 'JJ': { raise: 1 },
  'TT': { raise: 1 }, '99': { raise: 1 }, '88': { raise: 1 }, '77': { raise: 1 },
  '66': { raise: 1 }, '55': { raise: 1 }, '44': { raise: 0.9 }, '33': { raise: 0.8 },
  '22': { raise: 0.7 },
  'AKs': { raise: 1 }, 'AQs': { raise: 1 }, 'AJs': { raise: 1 }, 'ATs': { raise: 1 },
  'A9s': { raise: 1 }, 'A8s': { raise: 1 }, 'A7s': { raise: 0.9 }, 'A6s': { raise: 0.8 },
  'A5s': { raise: 1 }, 'A4s': { raise: 1 }, 'A3s': { raise: 0.9 }, 'A2s': { raise: 0.8 },
  'KQs': { raise: 1 }, 'KJs': { raise: 1 }, 'KTs': { raise: 1 }, 'K9s': { raise: 0.9 },
  'K8s': { raise: 0.7 }, 'K7s': { raise: 0.5 }, 'K6s': { raise: 0.4 },
  'QJs': { raise: 1 }, 'QTs': { raise: 1 }, 'Q9s': { raise: 0.8 }, 'Q8s': { raise: 0.4 },
  'JTs': { raise: 1 }, 'J9s': { raise: 0.9 }, 'J8s': { raise: 0.4 },
  'T9s': { raise: 1 }, 'T8s': { raise: 0.7 },
  '98s': { raise: 0.9 }, '97s': { raise: 0.4 },
  '87s': { raise: 0.8 }, '76s': { raise: 0.7 },
  '65s': { raise: 0.6 }, '54s': { raise: 0.5 },
  'AKo': { raise: 1 }, 'AQo': { raise: 1 }, 'AJo': { raise: 1 }, 'ATo': { raise: 1 },
  'A9o': { raise: 0.7 }, 'A8o': { raise: 0.5 }, 'A7o': { raise: 0.3 },
  'KQo': { raise: 1 }, 'KJo': { raise: 0.9 }, 'KTo': { raise: 0.7 },
  'QJo': { raise: 0.8 }, 'QTo': { raise: 0.5 },
  'JTo': { raise: 0.7 },
  'T9o': { raise: 0.4 },
};

// ──────────────────────────── BB vs Open (defend range) ────────────────────────────
const BB_VS_OPEN: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 1 }, 'JJ': { raise: 0.9, call: 0.1 },
  'TT': { raise: 0.6, call: 0.4 }, '99': { raise: 0.4, call: 0.6 }, '88': { raise: 0.2, call: 0.8 },
  '77': { call: 1 }, '66': { call: 0.9 }, '55': { call: 0.8 }, '44': { call: 0.7 },
  '33': { call: 0.6 }, '22': { call: 0.5 },
  'AKs': { raise: 1 }, 'AQs': { raise: 0.8, call: 0.2 }, 'AJs': { raise: 0.5, call: 0.5 },
  'ATs': { raise: 0.3, call: 0.7 }, 'A9s': { call: 1 }, 'A8s': { call: 0.9 },
  'A7s': { call: 0.8 }, 'A6s': { call: 0.7 }, 'A5s': { raise: 0.3, call: 0.7 },
  'A4s': { raise: 0.2, call: 0.7 }, 'A3s': { call: 0.7 }, 'A2s': { call: 0.6 },
  'KQs': { raise: 0.6, call: 0.4 }, 'KJs': { raise: 0.3, call: 0.7 }, 'KTs': { call: 0.9 },
  'K9s': { call: 0.7 }, 'K8s': { call: 0.5 }, 'K7s': { call: 0.4 },
  'QJs': { raise: 0.2, call: 0.8 }, 'QTs': { call: 0.8 }, 'Q9s': { call: 0.6 },
  'JTs': { call: 0.9 }, 'J9s': { call: 0.7 }, 'J8s': { call: 0.4 },
  'T9s': { call: 0.8 }, 'T8s': { call: 0.5 },
  '98s': { call: 0.8 }, '97s': { call: 0.4 },
  '87s': { call: 0.7 }, '76s': { call: 0.6 }, '65s': { call: 0.5 }, '54s': { call: 0.4 },
  'AKo': { raise: 1 }, 'AQo': { raise: 0.6, call: 0.4 }, 'AJo': { raise: 0.3, call: 0.5 },
  'ATo': { call: 0.7 }, 'A9o': { call: 0.5 },
  'KQo': { raise: 0.3, call: 0.6 }, 'KJo': { call: 0.6 }, 'KTo': { call: 0.4 },
  'QJo': { call: 0.5 }, 'QTo': { call: 0.3 },
  'JTo': { call: 0.4 },
  'T9o': { call: 0.3 },
};

// ──────────────────────────── vs 3-bet ranges (simplified) ────────────────────────────
const VS_3BET_TIGHT: Record<string, ActionFreq> = {
  'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.8, call: 0.2 },
  'JJ': { raise: 0.3, call: 0.7 }, 'TT': { call: 0.8 }, '99': { call: 0.5 },
  'AKs': { raise: 1 }, 'AQs': { raise: 0.3, call: 0.7 }, 'AJs': { call: 0.6 },
  'AKo': { raise: 0.8, call: 0.2 }, 'AQo': { call: 0.5 },
  'KQs': { call: 0.5 },
  'A5s': { raise: 0.3 }, 'A4s': { raise: 0.2 },
};

const VS_3BET_WIDE: Record<string, ActionFreq> = {
  ...VS_3BET_TIGHT,
  'QQ': { raise: 1 }, 'JJ': { raise: 0.6, call: 0.4 }, 'TT': { raise: 0.2, call: 0.8 },
  'AQs': { raise: 0.6, call: 0.4 }, 'AJs': { raise: 0.2, call: 0.7 },
  'ATs': { call: 0.6 }, 'KQs': { raise: 0.2, call: 0.7 }, 'KJs': { call: 0.5 },
  'AQo': { raise: 0.3, call: 0.5 },
};

// ──────────────────────────── Assemble data ────────────────────────────

export const PREFLOP_RANGES: PreflopRangeData = {
  UTG: {
    open_raise: buildMatrix(UTG_OPEN),
    vs_3bet: buildMatrix(VS_3BET_TIGHT),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.5, call: 0.3 },
      'AKs': { raise: 0.8, call: 0.2 }, 'AKo': { raise: 0.5, call: 0.2 },
    }),
  },
  MP: {
    open_raise: buildMatrix(MP_OPEN),
    vs_3bet: buildMatrix(VS_3BET_TIGHT),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.6, call: 0.3 },
      'AKs': { raise: 0.9, call: 0.1 }, 'AKo': { raise: 0.5, call: 0.3 },
    }),
  },
  CO: {
    open_raise: buildMatrix(CO_OPEN),
    vs_3bet: buildMatrix(VS_3BET_WIDE),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.7, call: 0.3 },
      'JJ': { raise: 0.2, call: 0.5 },
      'AKs': { raise: 1 }, 'AKo': { raise: 0.7, call: 0.3 },
      'AQs': { raise: 0.3, call: 0.3 },
    }),
  },
  BTN: {
    open_raise: buildMatrix(BTN_OPEN),
    vs_3bet: buildMatrix(VS_3BET_WIDE),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.7, call: 0.3 },
      'JJ': { raise: 0.3, call: 0.5 }, 'TT': { call: 0.5 },
      'AKs': { raise: 1 }, 'AKo': { raise: 0.7, call: 0.3 },
      'AQs': { raise: 0.3, call: 0.4 },
      'A5s': { raise: 0.2 },
    }),
  },
  SB: {
    open_raise: buildMatrix(SB_OPEN),
    vs_3bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.6, call: 0.4 },
      'JJ': { raise: 0.3, call: 0.5 }, 'TT': { call: 0.7 }, '99': { call: 0.4 },
      'AKs': { raise: 1 }, 'AQs': { raise: 0.4, call: 0.5 }, 'AJs': { call: 0.5 },
      'ATs': { call: 0.4 }, 'AKo': { raise: 0.7, call: 0.3 }, 'AQo': { call: 0.4 },
      'KQs': { call: 0.5 }, 'A5s': { raise: 0.2 }, 'A4s': { raise: 0.15 },
    }),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'AKs': { raise: 0.8, call: 0.2 },
      'QQ': { raise: 0.4, call: 0.3 }, 'AKo': { raise: 0.4, call: 0.2 },
    }),
  },
  BB: {
    vs_open: buildMatrix(BB_VS_OPEN),
    vs_3bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 }, 'QQ': { raise: 0.5, call: 0.5 },
      'JJ': { call: 0.8 }, 'TT': { call: 0.6 }, '99': { call: 0.4 },
      'AKs': { raise: 0.8, call: 0.2 }, 'AQs': { call: 0.6 }, 'AJs': { call: 0.4 },
      'AKo': { raise: 0.5, call: 0.3 },
      'KQs': { call: 0.4 },
    }),
    vs_4bet: buildMatrix({
      'AA': { raise: 1 }, 'KK': { raise: 1 },
      'AKs': { raise: 0.6, call: 0.3 }, 'AKo': { call: 0.3 },
      'QQ': { raise: 0.3, call: 0.3 },
    }),
  },
};
