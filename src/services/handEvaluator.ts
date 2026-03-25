import type { Card, HandRank, HandRankType, Rank } from '../types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const HAND_RANK_ORDER: Record<HandRankType, number> = {
  high_card: 0,
  one_pair: 1,
  two_pair: 2,
  three_of_a_kind: 3,
  straight: 4,
  flush: 5,
  full_house: 6,
  four_of_a_kind: 7,
  straight_flush: 8,
  royal_flush: 9,
};

const HAND_RANK_LABELS: Record<HandRankType, string> = {
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

function rankValue(r: Rank): number {
  return RANK_VALUES[r];
}

function sortByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
}

/** Encode a hand rank + kickers into a single comparable number. */
function encodeValue(type: HandRankType, kickers: number[]): number {
  let val = HAND_RANK_ORDER[type] * 1_00_00_00_00_00;
  for (let i = 0; i < kickers.length && i < 5; i++) {
    val += kickers[i] * Math.pow(100, 4 - i);
  }
  return val;
}

function getRankCounts(cards: Card[]): Map<Rank, Card[]> {
  const map = new Map<Rank, Card[]>();
  for (const c of cards) {
    const arr = map.get(c.rank) ?? [];
    arr.push(c);
    map.set(c.rank, arr);
  }
  return map;
}

function isFlush(cards: Card[]): Card[] | null {
  const suitMap = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = suitMap.get(c.suit) ?? [];
    arr.push(c);
    suitMap.set(c.suit, arr);
  }
  for (const [, suited] of suitMap) {
    if (suited.length >= 5) {
      return sortByRankDesc(suited).slice(0, 5);
    }
  }
  return null;
}

function findStraight(cards: Card[]): Card[] | null {
  // Deduplicate by rank, keeping one card per rank
  const seen = new Set<number>();
  const unique: Card[] = [];
  for (const c of sortByRankDesc(cards)) {
    const v = rankValue(c.rank);
    if (!seen.has(v)) {
      seen.add(v);
      unique.push(c);
    }
  }

  // Check for A-2-3-4-5 (wheel) — Ace counts as 1
  if (seen.has(14) && seen.has(2) && seen.has(3) && seen.has(4) && seen.has(5)) {
    const wheel: Card[] = [];
    for (const r of [5, 4, 3, 2] as const) {
      wheel.push(unique.find(c => rankValue(c.rank) === r)!);
    }
    wheel.push(unique.find(c => c.rank === 'A')!);
    return wheel;
  }

  // Normal straight check
  for (let i = 0; i <= unique.length - 5; i++) {
    const top = rankValue(unique[i].rank);
    let valid = true;
    for (let j = 1; j < 5; j++) {
      if (rankValue(unique[i + j].rank) !== top - j) {
        valid = false;
        break;
      }
    }
    if (valid) {
      return unique.slice(i, i + 5);
    }
  }
  return null;
}

function findStraightFlush(cards: Card[]): Card[] | null {
  const suitMap = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = suitMap.get(c.suit) ?? [];
    arr.push(c);
    suitMap.set(c.suit, arr);
  }
  for (const [, suited] of suitMap) {
    if (suited.length >= 5) {
      const straight = findStraight(suited);
      if (straight) return straight;
    }
  }
  return null;
}

function buildDescription(type: HandRankType, cards: Card[]): string {
  const label = HAND_RANK_LABELS[type];
  const sorted = sortByRankDesc(cards);
  const rankNames: Record<Rank, string> = {
    '2': 'Twos', '3': 'Threes', '4': 'Fours', '5': 'Fives',
    '6': 'Sixes', '7': 'Sevens', '8': 'Eights', '9': 'Nines',
    'T': 'Tens', 'J': 'Jacks', 'Q': 'Queens', 'K': 'Kings', 'A': 'Aces',
  };
  const singular: Record<Rank, string> = {
    '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five',
    '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
    'T': 'Ten', 'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace',
  };

  switch (type) {
    case 'royal_flush':
      return 'Royal Flush';
    case 'straight_flush':
      return `Straight Flush, ${singular[sorted[0].rank]} high`;
    case 'four_of_a_kind':
      return `Four of a Kind, ${rankNames[sorted[0].rank]}`;
    case 'full_house': {
      const counts = getRankCounts(sorted);
      let trips = sorted[0].rank;
      let pair = sorted[0].rank;
      for (const [r, arr] of counts) {
        if (arr.length >= 3) trips = r;
        else if (arr.length >= 2) pair = r;
      }
      return `Full House, ${rankNames[trips]} full of ${rankNames[pair]}`;
    }
    case 'flush':
      return `Flush, ${singular[sorted[0].rank]} high`;
    case 'straight':
      return `Straight, ${singular[sorted[0].rank]} high`;
    case 'three_of_a_kind':
      return `Three of a Kind, ${rankNames[sorted[0].rank]}`;
    case 'two_pair': {
      const counts = getRankCounts(sorted);
      const pairs: Rank[] = [];
      for (const [r, arr] of counts) {
        if (arr.length >= 2) pairs.push(r);
      }
      pairs.sort((a, b) => rankValue(b) - rankValue(a));
      return `Two Pair, ${rankNames[pairs[0]]} and ${rankNames[pairs[1]]}`;
    }
    case 'one_pair': {
      const counts = getRankCounts(sorted);
      for (const [r, arr] of counts) {
        if (arr.length >= 2) return `Pair of ${rankNames[r]}`;
      }
      return label;
    }
    default:
      return `${singular[sorted[0].rank]} High`;
  }
}

export function evaluateHand(cards: Card[]): HandRank {
  if (cards.length < 5) {
    const sorted = sortByRankDesc(cards);
    return {
      type: 'high_card',
      value: encodeValue('high_card', sorted.map(c => rankValue(c.rank))),
      description: cards.length > 0 ? `${cards[0].rank} High` : 'High Card',
      bestFiveCards: sorted,
    };
  }

  // Straight flush / Royal flush
  const sf = findStraightFlush(cards);
  if (sf) {
    const topRank = rankValue(sf[0].rank);
    const type: HandRankType = topRank === 14 ? 'royal_flush' : 'straight_flush';
    return {
      type,
      value: encodeValue(type, [topRank]),
      description: buildDescription(type, sf),
      bestFiveCards: sf,
    };
  }

  const rankCounts = getRankCounts(cards);
  const groups: { rank: Rank; count: number; cards: Card[] }[] = [];
  for (const [r, arr] of rankCounts) {
    groups.push({ rank: r, count: arr.length, cards: arr });
  }
  groups.sort((a, b) => b.count - a.count || rankValue(b.rank) - rankValue(a.rank));

  // Four of a kind
  if (groups[0].count >= 4) {
    const quads = groups[0].cards.slice(0, 4);
    const kicker = sortByRankDesc(cards.filter(c => c.rank !== groups[0].rank))[0];
    const best = [...quads, kicker];
    const rv = rankValue(groups[0].rank);
    return {
      type: 'four_of_a_kind',
      value: encodeValue('four_of_a_kind', [rv, rankValue(kicker.rank)]),
      description: buildDescription('four_of_a_kind', best),
      bestFiveCards: best,
    };
  }

  // Full house
  if (groups[0].count >= 3 && groups.length > 1 && groups[1].count >= 2) {
    const trips = groups[0].cards.slice(0, 3);
    const pair = groups[1].cards.slice(0, 2);
    const best = [...trips, ...pair];
    return {
      type: 'full_house',
      value: encodeValue('full_house', [rankValue(groups[0].rank), rankValue(groups[1].rank)]),
      description: buildDescription('full_house', best),
      bestFiveCards: best,
    };
  }

  // Flush
  const flushCards = isFlush(cards);
  if (flushCards) {
    return {
      type: 'flush',
      value: encodeValue('flush', flushCards.map(c => rankValue(c.rank))),
      description: buildDescription('flush', flushCards),
      bestFiveCards: flushCards,
    };
  }

  // Straight
  const straightCards = findStraight(cards);
  if (straightCards) {
    // For wheel (A-2-3-4-5), the high card is 5
    const topVal = straightCards[0].rank === 'A' && rankValue(straightCards[1].rank) === 5
      ? 5
      : rankValue(straightCards[0].rank);
    return {
      type: 'straight',
      value: encodeValue('straight', [topVal]),
      description: buildDescription('straight', straightCards),
      bestFiveCards: straightCards,
    };
  }

  // Three of a kind
  if (groups[0].count >= 3) {
    const trips = groups[0].cards.slice(0, 3);
    const kickers = sortByRankDesc(cards.filter(c => c.rank !== groups[0].rank)).slice(0, 2);
    const best = [...trips, ...kickers];
    return {
      type: 'three_of_a_kind',
      value: encodeValue('three_of_a_kind', [
        rankValue(groups[0].rank),
        ...kickers.map(c => rankValue(c.rank)),
      ]),
      description: buildDescription('three_of_a_kind', best),
      bestFiveCards: best,
    };
  }

  // Two pair
  if (groups[0].count >= 2 && groups[1].count >= 2) {
    const pair1 = groups[0].cards.slice(0, 2);
    const pair2 = groups[1].cards.slice(0, 2);
    const usedRanks = new Set([groups[0].rank, groups[1].rank]);
    const kicker = sortByRankDesc(cards.filter(c => !usedRanks.has(c.rank)))[0];
    const best = [...pair1, ...pair2, kicker];
    return {
      type: 'two_pair',
      value: encodeValue('two_pair', [
        rankValue(groups[0].rank),
        rankValue(groups[1].rank),
        rankValue(kicker.rank),
      ]),
      description: buildDescription('two_pair', best),
      bestFiveCards: best,
    };
  }

  // One pair
  if (groups[0].count >= 2) {
    const pair = groups[0].cards.slice(0, 2);
    const kickers = sortByRankDesc(cards.filter(c => c.rank !== groups[0].rank)).slice(0, 3);
    const best = [...pair, ...kickers];
    return {
      type: 'one_pair',
      value: encodeValue('one_pair', [
        rankValue(groups[0].rank),
        ...kickers.map(c => rankValue(c.rank)),
      ]),
      description: buildDescription('one_pair', best),
      bestFiveCards: best,
    };
  }

  // High card
  const sorted = sortByRankDesc(cards).slice(0, 5);
  return {
    type: 'high_card',
    value: encodeValue('high_card', sorted.map(c => rankValue(c.rank))),
    description: buildDescription('high_card', sorted),
    bestFiveCards: sorted,
  };
}

export function findBestFive(holeCards: Card[], communityCards: Card[]): HandRank {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length <= 5) {
    return evaluateHand(allCards);
  }

  // Generate all C(n,5) combinations and find the best
  let bestHand: HandRank | null = null;
  const n = allCards.length;

  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            const combo = [allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]];
            const hand = evaluateHand(combo);
            if (!bestHand || hand.value > bestHand.value) {
              bestHand = hand;
            }
          }
        }
      }
    }
  }

  return bestHand!;
}

export function compareHands(handA: HandRank, handB: HandRank): number {
  return handA.value - handB.value;
}
