import type { Card, BoardTexture, Rank } from '../types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/**
 * Classify the height of the board based on the highest card(s).
 * high: at least one card >= J (11)
 * mid: highest card between 7 and T
 * low: highest card <= 6
 */
function classifyHeight(cards: Card[]): 'high' | 'mid' | 'low' {
  const values = cards.map((c) => RANK_VALUES[c.rank]);
  const maxVal = Math.max(...values);
  if (maxVal >= 11) return 'high';
  if (maxVal >= 7) return 'mid';
  return 'low';
}

/**
 * Classify the flush draw potential of the board.
 * monotone: 3+ cards of the same suit
 * two_tone: exactly 2 cards of the same suit (at least one pair of suits)
 * rainbow: all different suits (only possible with 3 cards)
 */
function classifyFlush(cards: Card[]): 'rainbow' | 'two_tone' | 'monotone' {
  const suitCounts: Record<string, number> = {};
  for (const c of cards) {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  }
  const maxSuitCount = Math.max(...Object.values(suitCounts));
  if (maxSuitCount >= 3) return 'monotone';
  if (maxSuitCount === 2) return 'two_tone';
  return 'rainbow';
}

/**
 * Classify whether the board is "wet" (coordinated/connected) or "dry" (disconnected).
 * Wet boards have straight draw potential and/or connected cards.
 * We check for:
 * - Cards within a 5-card window (straight possible)
 * - Number of unique gaps between sorted values
 */
function classifyWetness(cards: Card[]): 'wet' | 'dry' {
  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  const unique = [...new Set(values)];

  // Check for connected cards (adjacent values)
  let connectedPairs = 0;
  for (let i = 0; i < unique.length - 1; i++) {
    const gap = unique[i + 1] - unique[i];
    if (gap <= 2) connectedPairs++;
  }

  // Count how many cards fit within a 5-card straight window
  let maxInWindow = 0;
  for (let i = 0; i < unique.length; i++) {
    let count = 0;
    for (let j = i; j < unique.length; j++) {
      if (unique[j] - unique[i] <= 4) count++;
      else break;
    }
    maxInWindow = Math.max(maxInWindow, count);
  }

  // Also account for A-low straights (A,2,3,4,5)
  if (unique.includes(14)) {
    const lowValues = [1, ...unique.filter((v) => v <= 5)].sort((a, b) => a - b);
    const uniqueLow = [...new Set(lowValues)];
    for (let i = 0; i < uniqueLow.length; i++) {
      let count = 0;
      for (let j = i; j < uniqueLow.length; j++) {
        if (uniqueLow[j] - uniqueLow[i] <= 4) count++;
        else break;
      }
      maxInWindow = Math.max(maxInWindow, count);
    }
  }

  // Wet if multiple cards are connected or if many cards fall within a straight window
  if (cards.length >= 3) {
    if (connectedPairs >= 2 || maxInWindow >= 3) return 'wet';
  }
  if (connectedPairs >= 1 && maxInWindow >= 2) return 'wet';

  return 'dry';
}

/**
 * Classify community cards into a board texture category.
 * Returns one of 18 board texture types: {high|mid|low}_{dry|wet}_{rainbow|two_tone|monotone}
 */
export function classifyBoard(communityCards: Card[]): BoardTexture {
  if (communityCards.length < 3) {
    // Default for incomplete boards (shouldn't happen in normal flow)
    return 'mid_dry_rainbow';
  }

  // Use first 3 cards for primary classification (flop texture),
  // but consider all available cards for more accurate reads on turn/river
  const height = classifyHeight(communityCards);
  const flush = classifyFlush(communityCards);
  const wetness = classifyWetness(communityCards);

  return `${height}_${wetness}_${flush}` as BoardTexture;
}
