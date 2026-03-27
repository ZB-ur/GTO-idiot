import type { Card, Rank } from '../types';
import type { HandRank, HandRankCategory } from './types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const CATEGORY_BASE: Record<HandRankCategory, number> = {
  'high_card': 0,
  'one_pair': 1000000,
  'two_pair': 2000000,
  'three_of_a_kind': 3000000,
  'straight': 4000000,
  'flush': 5000000,
  'full_house': 6000000,
  'four_of_a_kind': 7000000,
  'straight_flush': 8000000,
};

const CATEGORY_NAMES: Record<HandRankCategory, string> = {
  'high_card': '高牌',
  'one_pair': '一对',
  'two_pair': '两对',
  'three_of_a_kind': '三条',
  'straight': '顺子',
  'flush': '同花',
  'full_house': '葫芦',
  'four_of_a_kind': '四条',
  'straight_flush': '同花顺',
};

function rankValue(card: Card): number {
  return RANK_VALUES[card.rank];
}

function rankName(rank: Rank): string {
  const names: Record<Rank, string> = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8',
    '9': '9', 'T': '10', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A',
  };
  return names[rank];
}

/** Generate all C(n,5) combinations from an array */
function combinations5(cards: Card[]): Card[][] {
  const result: Card[][] = [];
  const n = cards.length;
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
          }
        }
      }
    }
  }
  return result;
}

/** Evaluate exactly 5 cards, returning category + numeric rank */
function evaluate5(cards: Card[]): { category: HandRankCategory; rank: number; description: string } {
  const sorted = [...cards].sort((a, b) => rankValue(b) - rankValue(a));
  const values = sorted.map(rankValue);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);

  // Check straight (including A-2-3-4-5 wheel)
  let isStraight = false;
  let straightHigh = 0;
  if (values[0] - values[4] === 4 && new Set(values).size === 5) {
    isStraight = true;
    straightHigh = values[0];
  } else if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    // A-2-3-4-5 wheel
    isStraight = true;
    straightHigh = 5;
  }

  // Count ranks
  const countMap = new Map<number, number>();
  for (const v of values) {
    countMap.set(v, (countMap.get(v) ?? 0) + 1);
  }
  const counts = [...countMap.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  if (isStraight && isFlush) {
    const rank = CATEGORY_BASE['straight_flush'] + straightHigh;
    const highCard = sorted.find(c => rankValue(c) === straightHigh) ?? sorted[0];
    return { category: 'straight_flush', rank, description: `同花顺 ${rankName(highCard.rank)}高` };
  }

  if (counts[0][1] === 4) {
    const quadVal = counts[0][0];
    const kicker = counts[1][0];
    const rank = CATEGORY_BASE['four_of_a_kind'] + quadVal * 15 + kicker;
    const quadRank = sorted.find(c => rankValue(c) === quadVal)!.rank;
    return { category: 'four_of_a_kind', rank, description: `四条 ${rankName(quadRank)}` };
  }

  if (counts[0][1] === 3 && counts[1][1] === 2) {
    const tripVal = counts[0][0];
    const pairVal = counts[1][0];
    const rank = CATEGORY_BASE['full_house'] + tripVal * 15 + pairVal;
    const tripRank = sorted.find(c => rankValue(c) === tripVal)!.rank;
    const pairRank = sorted.find(c => rankValue(c) === pairVal)!.rank;
    return { category: 'full_house', rank, description: `葫芦 ${rankName(tripRank)}满${rankName(pairRank)}` };
  }

  if (isFlush) {
    const rank = CATEGORY_BASE['flush'] + values[0] * 15 ** 4 + values[1] * 15 ** 3 + values[2] * 15 ** 2 + values[3] * 15 + values[4];
    return { category: 'flush', rank, description: `同花 ${rankName(sorted[0].rank)}高` };
  }

  if (isStraight) {
    const rank = CATEGORY_BASE['straight'] + straightHigh;
    const highCard = straightHigh === 5 ? sorted.find(c => c.rank === '5')! : sorted[0];
    return { category: 'straight', rank, description: `顺子 ${rankName(highCard.rank)}高` };
  }

  if (counts[0][1] === 3) {
    const tripVal = counts[0][0];
    const kickers = counts.slice(1).map(c => c[0]).sort((a, b) => b - a);
    const rank = CATEGORY_BASE['three_of_a_kind'] + tripVal * 15 ** 2 + kickers[0] * 15 + kickers[1];
    const tripRank = sorted.find(c => rankValue(c) === tripVal)!.rank;
    return { category: 'three_of_a_kind', rank, description: `三条 ${rankName(tripRank)}` };
  }

  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const highPair = Math.max(counts[0][0], counts[1][0]);
    const lowPair = Math.min(counts[0][0], counts[1][0]);
    const kicker = counts[2][0];
    const rank = CATEGORY_BASE['two_pair'] + highPair * 15 ** 2 + lowPair * 15 + kicker;
    const highRank = sorted.find(c => rankValue(c) === highPair)!.rank;
    const lowRankCard = sorted.find(c => rankValue(c) === lowPair)!.rank;
    return { category: 'two_pair', rank, description: `两对 ${rankName(highRank)}和${rankName(lowRankCard)}` };
  }

  if (counts[0][1] === 2) {
    const pairVal = counts[0][0];
    const kickers = counts.slice(1).map(c => c[0]).sort((a, b) => b - a);
    const rank = CATEGORY_BASE['one_pair'] + pairVal * 15 ** 3 + kickers[0] * 15 ** 2 + kickers[1] * 15 + kickers[2];
    const pairRank = sorted.find(c => rankValue(c) === pairVal)!.rank;
    return { category: 'one_pair', rank, description: `一对 ${rankName(pairRank)}` };
  }

  // High card
  const rank = CATEGORY_BASE['high_card'] + values[0] * 15 ** 4 + values[1] * 15 ** 3 + values[2] * 15 ** 2 + values[3] * 15 + values[4];
  return { category: 'high_card', rank, description: `高牌 ${rankName(sorted[0].rank)}` };
}

export function evaluateHand(holeCards: [Card, Card], communityCards: Card[]): HandRank {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    // Not enough cards to evaluate — return high card based on hole cards
    const sorted = [...allCards].sort((a, b) => rankValue(b) - rankValue(a));
    return {
      category: 'high_card',
      rank: rankValue(sorted[0]),
      description: `高牌 ${rankName(sorted[0].rank)}`,
      bestFive: sorted.slice(0, Math.min(5, sorted.length)) as Card[],
    };
  }

  const combos = combinations5(allCards);
  let best: { category: HandRankCategory; rank: number; description: string; cards: Card[] } | null = null;

  for (const combo of combos) {
    const result = evaluate5(combo);
    if (best === null || result.rank > best.rank) {
      best = { ...result, cards: combo };
    }
  }

  return {
    category: best!.category,
    rank: best!.rank,
    description: best!.description,
    bestFive: best!.cards,
  };
}

export function compareHands(a: HandRank, b: HandRank): number {
  return a.rank - b.rank;
}
