import type { HandState, BotProfile, BotDecision, ActionType, Card, Rank, Street, HandPlayerState } from '../types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/** Convert two hole cards to a canonical hand notation like "AKs", "TT", "72o" */
function toHandNotation(cards: Card[]): string {
  if (cards.length < 2) return '';
  const [c1, c2] = cards;
  const v1 = RANK_VALUES[c1.rank];
  const v2 = RANK_VALUES[c2.rank];
  const high = v1 >= v2 ? c1 : c2;
  const low = v1 >= v2 ? c2 : c1;
  if (high.rank === low.rank) return `${high.rank}${low.rank}`;
  const suited = high.suit === low.suit ? 's' : 'o';
  return `${high.rank}${low.rank}${suited}`;
}

/** Estimate raw hand strength 0-1 for preflop based on rank values and suitedness */
function preflopHandStrength(cards: Card[]): number {
  if (cards.length < 2) return 0.2;
  const v1 = RANK_VALUES[cards[0].rank];
  const v2 = RANK_VALUES[cards[1].rank];
  const high = Math.max(v1, v2);
  const low = Math.min(v1, v2);
  const isPair = v1 === v2;
  const isSuited = cards[0].suit === cards[1].suit;
  const gap = high - low;

  let strength = 0;

  if (isPair) {
    // Pairs: 22=0.45, AA=0.95
    strength = 0.45 + ((high - 2) / 12) * 0.5;
  } else {
    // High card value contribution
    strength = ((high - 2) / 12) * 0.35 + ((low - 2) / 12) * 0.15;
    // Connectivity bonus
    if (gap <= 2) strength += 0.05;
    if (gap <= 1) strength += 0.05;
    // Suited bonus
    if (isSuited) strength += 0.06;
    // Broadway bonus
    if (high >= 10 && low >= 10) strength += 0.08;
  }

  return Math.min(1, Math.max(0, strength));
}

/** Simple postflop hand strength estimator (0-1) based on pairs/draws on board */
function postflopHandStrength(holeCards: Card[], communityCards: Card[]): number {
  if (holeCards.length < 2 || communityCards.length === 0) return preflopHandStrength(holeCards);

  const allCards = [...holeCards, ...communityCards];
  const rankCounts = new Map<Rank, number>();
  const suitCounts = new Map<string, number>();

  for (const c of allCards) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) ?? 0) + 1);
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }

  let strength = 0.15;
  const holeRanks = holeCards.map(c => c.rank);

  // Check for made hands using hole cards
  let pairCount = 0;
  let hasTrips = false;
  let hasQuads = false;

  for (const rank of holeRanks) {
    const count = rankCounts.get(rank) ?? 0;
    if (count >= 4) hasQuads = true;
    else if (count >= 3) hasTrips = true;
    else if (count >= 2) pairCount++;
  }

  if (hasQuads) strength = 0.95;
  else if (hasTrips && pairCount > 0) strength = 0.90; // Full house likely
  else if (hasTrips) strength = 0.75;
  else if (pairCount >= 2) strength = 0.65;
  else if (pairCount === 1) {
    // Top pair vs low pair
    const pairedRank = holeRanks.find(r => (rankCounts.get(r) ?? 0) >= 2);
    const boardRankValues = communityCards.map(c => RANK_VALUES[c.rank]).sort((a, b) => b - a);
    const pairedValue = pairedRank ? RANK_VALUES[pairedRank] : 0;
    if (pairedValue >= (boardRankValues[0] ?? 0)) {
      strength = 0.55 + (pairedValue / 14) * 0.15; // Top pair
    } else {
      strength = 0.35 + (pairedValue / 14) * 0.1; // Lower pair
    }
  } else {
    // No pair — high card strength
    const highCard = Math.max(RANK_VALUES[holeCards[0].rank], RANK_VALUES[holeCards[1].rank]);
    strength = 0.10 + (highCard / 14) * 0.2;
  }

  // Flush draw bonus
  for (const suit of holeCards.map(c => c.suit)) {
    const suitCount = suitCounts.get(suit) ?? 0;
    if (suitCount >= 5) strength = Math.max(strength, 0.85); // Made flush
    else if (suitCount >= 4) strength += 0.10; // Flush draw
  }

  // Straight potential (simplified)
  const sortedValues = [...new Set(allCards.map(c => RANK_VALUES[c.rank]))].sort((a, b) => a - b);
  let maxConsecutive = 1;
  let consecutive = 1;
  for (let i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] === sortedValues[i - 1] + 1) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 1;
    }
  }
  // Wheel check (A-2-3-4-5)
  if (sortedValues.includes(14) && sortedValues.includes(2) && sortedValues.includes(3)) {
    const wheelCount = [14, 2, 3, 4, 5].filter(v => sortedValues.includes(v)).length;
    maxConsecutive = Math.max(maxConsecutive, wheelCount);
  }

  if (maxConsecutive >= 5) strength = Math.max(strength, 0.80); // Made straight
  else if (maxConsecutive >= 4) strength += 0.06; // Straight draw

  return Math.min(1, Math.max(0, strength));
}

/** Compute a pot odds ratio: amount to call / (pot + amount to call) */
function potOdds(potTotal: number, callAmount: number): number {
  if (callAmount <= 0) return 0;
  return callAmount / (potTotal + callAmount);
}

/** Determine available actions from hand state for the current bot */
function getAvailableActions(handState: HandState, botSeat: number): {
  canCheck: boolean;
  canCall: boolean;
  canBet: boolean;
  canRaise: boolean;
  callAmount: number;
  currentBetToMatch: number;
  botChips: number;
  potSize: number;
} {
  const botPlayer = handState.players[botSeat] as HandPlayerState | undefined;
  const botChips = botPlayer?.chipCount ?? 0;
  const botCurrentBet = botPlayer?.currentBet ?? 0;
  const potSize = handState.pot.totalPot;

  // Find the current highest bet
  let currentBetToMatch = 0;
  for (const p of handState.players) {
    if (p.currentBet > currentBetToMatch) currentBetToMatch = p.currentBet;
  }

  const callAmount = Math.min(currentBetToMatch - botCurrentBet, botChips);
  const canCheck = currentBetToMatch <= botCurrentBet;
  const canCall = !canCheck && callAmount > 0 && callAmount < botChips;
  const canBet = canCheck && botChips > 0;
  const canRaise = !canCheck && botChips > callAmount;

  return { canCheck, canCall, canBet, canRaise, callAmount, currentBetToMatch, botChips, potSize };
}

/** Calculate a thinking delay that feels natural, varying by profile */
function thinkTime(profile: BotProfile): number {
  const base = 800;
  const variance = Math.random() * 1200;
  // Nits think longer, Fish faster
  const styleMultiplier = profile.style === 'Nit' ? 1.3
    : profile.style === 'Fish' ? 0.7
    : profile.style === 'GTO' ? 1.1
    : 1.0;
  return Math.round((base + variance) * styleMultiplier);
}

/** Decide a sizing for bet/raise as a fraction of pot */
function decideSizing(
  profile: BotProfile,
  potSize: number,
  botChips: number,
  street: Street,
  isRaise: boolean,
  currentBetToMatch: number,
): number {
  let fraction: number;

  switch (profile.style) {
    case 'TAG':
      fraction = street === 'preflop' ? 3.0 : (isRaise ? 3.0 : 0.66);
      break;
    case 'LAG':
      fraction = street === 'preflop' ? 3.0 : (isRaise ? 3.5 : 0.75);
      break;
    case 'Nit':
      fraction = street === 'preflop' ? 2.5 : (isRaise ? 2.5 : 0.5);
      break;
    case 'Fish':
      // Fish use weird sizings
      fraction = street === 'preflop' ? (2 + Math.random() * 3) : (0.3 + Math.random() * 1.2);
      break;
    case 'GTO':
      fraction = street === 'preflop' ? 2.5 : (isRaise ? 3.0 : 0.33 + Math.random() * 0.34);
      break;
    default:
      fraction = 0.66;
  }

  let amount: number;
  if (street === 'preflop') {
    // Preflop: sizing is in BB multiples
    amount = isRaise ? currentBetToMatch * 3 : fraction;
  } else {
    // Postflop: fraction of pot
    amount = isRaise ? currentBetToMatch * fraction : potSize * fraction;
  }

  // Round to nearest 0.5
  amount = Math.round(amount * 2) / 2;
  // Clamp to bot's stack
  amount = Math.min(amount, botChips);
  // Ensure minimum of 1 BB
  amount = Math.max(amount, 1);

  return amount;
}

/**
 * Main BOT decision engine.
 * Uses the bot's play-style profile stats (VPIP, PFR, aggression, c-bet frequencies)
 * combined with hand strength estimation to produce realistic, profile-driven decisions.
 */
export function decideBotAction(handState: HandState, botProfile: BotProfile): BotDecision {
  const botSeat = handState.currentActorSeatIndex;
  const botPlayer = handState.players[botSeat];

  if (!botPlayer || botPlayer.hasFolded || botPlayer.isAllIn) {
    return { actionType: 'fold', amount: 0, thinkTimeMs: thinkTime(botProfile) };
  }

  const holeCards = botPlayer.holeCards ?? [];
  const { canCheck, canCall, canBet, canRaise, callAmount, currentBetToMatch, botChips, potSize } = getAvailableActions(handState, botSeat);
  const street = handState.street;
  const isPreflop = street === 'preflop';

  // Evaluate hand strength
  const strength = isPreflop
    ? preflopHandStrength(holeCards)
    : postflopHandStrength(holeCards, handState.communityCards);

  // Add noise to simulate imperfect play (less noise for GTO bots)
  const noiseLevel = botProfile.style === 'GTO' ? 0.03 : (botProfile.style === 'Fish' ? 0.15 : 0.08);
  const noise = (Math.random() - 0.5) * 2 * noiseLevel;
  const adjustedStrength = Math.min(1, Math.max(0, strength + noise));

  let actionType: ActionType;
  let amount = 0;

  if (isPreflop) {
    actionType = decidePreflopAction(adjustedStrength, botProfile, canCheck, canCall, canBet, canRaise, callAmount, botChips);
  } else {
    actionType = decidePostflopAction(adjustedStrength, botProfile, canCheck, canCall, canBet, canRaise, callAmount, potSize, botChips, street);
  }

  // Calculate sizing for bets and raises
  if (actionType === 'bet' || actionType === 'raise') {
    amount = decideSizing(botProfile, potSize, botChips, street, actionType === 'raise', currentBetToMatch);
    // If sizing would be all-in or nearly all-in, go all-in
    if (amount >= botChips * 0.9) {
      actionType = 'all_in';
      amount = botChips;
    }
  } else if (actionType === 'call') {
    amount = callAmount;
  } else if (actionType === 'all_in') {
    amount = botChips;
  }

  // Validate: if we can't do the chosen action, fall back
  if (actionType === 'raise' && !canRaise) actionType = canCall ? 'call' : (canCheck ? 'check' : 'fold');
  if (actionType === 'bet' && !canBet) actionType = canCheck ? 'check' : 'fold';
  if (actionType === 'call' && !canCall) actionType = canCheck ? 'check' : 'fold';

  if (actionType === 'call') amount = callAmount;
  if (actionType === 'fold') amount = 0;
  if (actionType === 'check') amount = 0;

  return {
    actionType,
    amount,
    thinkTimeMs: thinkTime(botProfile),
  };
}

/** Preflop decision using VPIP/PFR thresholds against hand strength */
function decidePreflopAction(
  strength: number,
  profile: BotProfile,
  canCheck: boolean,
  canCall: boolean,
  canBet: boolean,
  canRaise: boolean,
  callAmount: number,
  botChips: number,
): ActionType {
  // Normalize profile stats to 0-1 thresholds
  const vpipThreshold = 1 - (profile.vpip / 100); // lower = plays more hands
  const pfrThreshold = 1 - (profile.pfr / 100);
  const threeBetThreshold = 1 - profile.threeBetFrequency;

  // Premium hands — always raise/3-bet
  if (strength > 0.88) {
    if (canRaise) return 'raise';
    if (canBet) return 'bet';
    if (canCall) return 'call';
    return 'check';
  }

  // Strong hands — raise or call depending on profile aggression
  if (strength > pfrThreshold) {
    if (canRaise && Math.random() < profile.aggressionFrequency) return 'raise';
    if (canBet && Math.random() < profile.aggressionFrequency) return 'bet';
    if (canCall) return 'call';
    return canCheck ? 'check' : 'fold';
  }

  // Playable hands — VPIP range
  if (strength > vpipThreshold) {
    if (canCall) return 'call';
    if (canCheck) return 'check';
    // Marginal — sometimes fold facing a raise
    return Math.random() < 0.3 ? 'fold' : (canCall ? 'call' : 'fold');
  }

  // Facing a raise with a speculative hand? 3-bet bluff occasionally (LAG/GTO)
  if (canRaise && strength > 0.40 && Math.random() > threeBetThreshold) {
    return 'raise';
  }

  // Below VPIP threshold — fold (or check if free)
  if (canCheck) return 'check';
  return 'fold';
}

/** Postflop decision using hand strength, pot odds, and profile tendencies */
function decidePostflopAction(
  strength: number,
  profile: BotProfile,
  canCheck: boolean,
  canCall: boolean,
  canBet: boolean,
  canRaise: boolean,
  callAmount: number,
  potSize: number,
  botChips: number,
  street: Street,
): ActionType {
  const odds = potOdds(potSize, callAmount);
  const isLateStreet = street === 'turn' || street === 'river';

  // Monster hand — go for value
  if (strength > 0.82) {
    if (canRaise && Math.random() < profile.aggressionFrequency * 1.2) return 'raise';
    if (canBet) return 'bet';
    if (canCall) return 'call';
    return 'check';
  }

  // Strong hand — bet/raise for value, or call
  if (strength > 0.60) {
    if (canBet && Math.random() < profile.cbetFrequency) return 'bet';
    if (canRaise && Math.random() < profile.aggressionFrequency * 0.7) return 'raise';
    if (canCall) return 'call';
    return canCheck ? 'check' : 'fold';
  }

  // Medium hand — depends on pot odds and profile
  if (strength > 0.40) {
    // C-bet bluff opportunity (first to act with initiative implied)
    if (canBet && !isLateStreet && Math.random() < profile.cbetFrequency * 0.6) return 'bet';

    // Call if pot odds are favorable
    if (canCall && strength > odds * 1.2) return 'call';

    // Fold to c-bet based on profile tendency
    if (canCall && Math.random() < profile.foldToCbetFrequency) return 'fold';

    if (canCall) return 'call';
    return canCheck ? 'check' : 'fold';
  }

  // Weak hand — mostly fold or check, occasional bluff
  if (strength > 0.25) {
    if (canCheck) return 'check';
    // Bluff frequency based on aggression
    if (canBet && !isLateStreet && Math.random() < profile.aggressionFrequency * 0.25) return 'bet';
    // Call with drawing potential if odds are good
    if (canCall && strength > odds * 0.8) return 'call';
    return 'fold';
  }

  // Very weak — check or fold, rare bluff
  if (canCheck) return 'check';
  if (canBet && Math.random() < profile.aggressionFrequency * 0.08) return 'bet';
  return 'fold';
}
