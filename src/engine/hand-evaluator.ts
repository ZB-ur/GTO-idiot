import type { Card, HandEvaluation, HandEvaluationResult, HandRank, Rank } from '../types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const HAND_RANK_VALUES: Record<HandRank, number> = {
  high_card: 1,
  one_pair: 2,
  two_pair: 3,
  three_of_a_kind: 4,
  straight: 5,
  flush: 6,
  full_house: 7,
  four_of_a_kind: 8,
  straight_flush: 9,
  royal_flush: 10,
};

const HAND_RANK_NAMES: Record<HandRank, string> = {
  high_card: 'High Card',
  one_pair: 'One Pair',
  two_pair: 'Two Pair',
  three_of_a_kind: 'Three of a Kind',
  straight: 'Straight',
  flush: 'Flush',
  full_house: 'Full House',
  four_of_a_kind: 'Four of a Kind',
  straight_flush: 'Straight Flush',
  royal_flush: 'Royal Flush',
};

const RANK_NAMES: Record<Rank, string> = {
  '2': 'Twos', '3': 'Threes', '4': 'Fours', '5': 'Fives', '6': 'Sixes',
  '7': 'Sevens', '8': 'Eights', '9': 'Nines', 'T': 'Tens', 'J': 'Jacks',
  'Q': 'Queens', 'K': 'Kings', 'A': 'Aces',
};

function rankVal(card: Card): number {
  return RANK_VALUES[card.rank];
}

/** Generate all 5-card combinations from an array of cards */
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

interface FiveCardResult {
  rank: HandRank;
  /** Primary rank value * 10^10 + kicker encoding for total ordering */
  score: number;
  cards: Card[];
  description: string;
}

function evaluateFiveCards(hand: Card[]): FiveCardResult {
  const sorted = [...hand].sort((a, b) => rankVal(b) - rankVal(a));
  const values = sorted.map(rankVal);

  // Count rank frequencies
  const freqMap = new Map<number, number>();
  for (const v of values) {
    freqMap.set(v, (freqMap.get(v) ?? 0) + 1);
  }
  const freqs = [...freqMap.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // by frequency desc
    return b[0] - a[0]; // by rank desc
  });

  // Check flush
  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);

  // Check straight
  let isStraight = false;
  let straightHigh = 0;
  // Normal straight
  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHigh = values[0];
  }
  // Wheel (A-2-3-4-5)
  if (!isStraight && values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    isStraight = true;
    straightHigh = 5; // 5-high straight
  }

  // Build kicker score: encode up to 5 kicker values in descending significance
  const encodeKickers = (...kickers: number[]): number => {
    let score = 0;
    for (let i = 0; i < kickers.length; i++) {
      score += kickers[i] * Math.pow(15, 4 - i);
    }
    return score;
  };

  // Determine hand rank
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        rank: 'royal_flush',
        score: HAND_RANK_VALUES.royal_flush * 1e10 + encodeKickers(14),
        cards: sorted,
        description: 'Royal Flush',
      };
    }
    // For wheel straight flush, reorder cards
    const sfCards = straightHigh === 5
      ? [sorted[1], sorted[2], sorted[3], sorted[4], sorted[0]] // move ace to end
      : sorted;
    return {
      rank: 'straight_flush',
      score: HAND_RANK_VALUES.straight_flush * 1e10 + encodeKickers(straightHigh),
      cards: sfCards,
      description: `Straight Flush, ${straightHigh === 5 ? 'Five' : RANK_NAMES[sorted[0].rank]} high`,
    };
  }

  if (freqs[0][1] === 4) {
    const quadRank = freqs[0][0];
    const kicker = freqs[1][0];
    return {
      rank: 'four_of_a_kind',
      score: HAND_RANK_VALUES.four_of_a_kind * 1e10 + encodeKickers(quadRank, kicker),
      cards: sorted,
      description: `Four of a Kind, ${rankNameSingular(quadRank)}s`,
    };
  }

  if (freqs[0][1] === 3 && freqs[1][1] === 2) {
    const tripRank = freqs[0][0];
    const pairRank = freqs[1][0];
    return {
      rank: 'full_house',
      score: HAND_RANK_VALUES.full_house * 1e10 + encodeKickers(tripRank, pairRank),
      cards: sorted,
      description: `Full House, ${rankNameSingular(tripRank)}s full of ${rankNameSingular(pairRank)}s`,
    };
  }

  if (isFlush) {
    return {
      rank: 'flush',
      score: HAND_RANK_VALUES.flush * 1e10 + encodeKickers(...values),
      cards: sorted,
      description: `Flush, ${rankNameSingular(values[0])} high`,
    };
  }

  if (isStraight) {
    const strCards = straightHigh === 5
      ? [sorted[1], sorted[2], sorted[3], sorted[4], sorted[0]]
      : sorted;
    return {
      rank: 'straight',
      score: HAND_RANK_VALUES.straight * 1e10 + encodeKickers(straightHigh),
      cards: strCards,
      description: `Straight, ${straightHigh === 5 ? 'Five' : rankNameSingular(straightHigh)} high`,
    };
  }

  if (freqs[0][1] === 3) {
    const tripRank = freqs[0][0];
    const k1 = freqs[1][0];
    const k2 = freqs[2][0];
    return {
      rank: 'three_of_a_kind',
      score: HAND_RANK_VALUES.three_of_a_kind * 1e10 + encodeKickers(tripRank, k1, k2),
      cards: sorted,
      description: `Three of a Kind, ${rankNameSingular(tripRank)}s`,
    };
  }

  if (freqs[0][1] === 2 && freqs[1][1] === 2) {
    const highPair = Math.max(freqs[0][0], freqs[1][0]);
    const lowPair = Math.min(freqs[0][0], freqs[1][0]);
    const kicker = freqs[2][0];
    return {
      rank: 'two_pair',
      score: HAND_RANK_VALUES.two_pair * 1e10 + encodeKickers(highPair, lowPair, kicker),
      cards: sorted,
      description: `Two Pair, ${rankNameSingular(highPair)}s and ${rankNameSingular(lowPair)}s`,
    };
  }

  if (freqs[0][1] === 2) {
    const pairRank = freqs[0][0];
    const k1 = freqs[1][0];
    const k2 = freqs[2][0];
    const k3 = freqs[3][0];
    return {
      rank: 'one_pair',
      score: HAND_RANK_VALUES.one_pair * 1e10 + encodeKickers(pairRank, k1, k2, k3),
      cards: sorted,
      description: `Pair of ${rankNameSingular(pairRank)}s`,
    };
  }

  return {
    rank: 'high_card',
    score: HAND_RANK_VALUES.high_card * 1e10 + encodeKickers(...values),
    cards: sorted,
    description: `${rankNameSingular(values[0])} High`,
  };
}

function rankNameSingular(value: number): string {
  const names: Record<number, string> = {
    2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven',
    8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace',
  };
  return names[value] ?? String(value);
}

export class HandEvaluator {
  evaluate(holeCards: Card[], communityCards: Card[]): HandEvaluation {
    const allCards = [...holeCards, ...communityCards];

    // If fewer than 5 cards total, pad evaluation
    if (allCards.length < 5) {
      const sorted = [...allCards].sort((a, b) => rankVal(b) - rankVal(a));
      return {
        rank: 'high_card',
        rankValue: rankVal(sorted[0]),
        bestFiveCards: sorted.slice(0, 5),
        description: 'High Card',
      };
    }

    const combos = combinations5(allCards);
    let best: FiveCardResult | null = null;

    for (const combo of combos) {
      const result = evaluateFiveCards(combo);
      if (!best || result.score > best.score) {
        best = result;
      }
    }

    return {
      rank: best!.rank,
      rankValue: best!.score,
      bestFiveCards: best!.cards,
      description: best!.description,
    };
  }

  compareHands(
    hands: { playerId: string; holeCards: Card[] }[],
    communityCards: Card[]
  ): HandEvaluationResult {
    const evaluations = hands.map((h) => {
      const evaluation = this.evaluate(h.holeCards, communityCards);
      return {
        playerId: h.playerId,
        rank: evaluation.rank,
        rankDescription: evaluation.description,
        bestFiveCards: evaluation.bestFiveCards,
        rankValue: evaluation.rankValue,
      };
    });

    // Find the maximum rank value
    const maxRankValue = Math.max(...evaluations.map((e) => e.rankValue));
    const winners = evaluations
      .filter((e) => e.rankValue === maxRankValue)
      .map((e) => e.playerId);

    return { evaluations, winners };
  }
}
