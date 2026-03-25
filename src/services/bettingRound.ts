import type { ActionType, HandPlayerState, BettingRoundState } from '../types';

const NUM_SEATS = 6;

/** Find the next active player who can act, starting from startIdx (exclusive). */
function findNextActor(
  players: HandPlayerState[],
  startIdx: number,
  playersActed: Set<number>,
  currentBet: number,
  isPreflop: boolean
): number {
  for (let i = 1; i <= NUM_SEATS; i++) {
    const idx = (startIdx + i) % NUM_SEATS;
    const p = players[idx];
    if (!p) continue;
    if (p.hasFolded || p.isAllIn) continue;
    // Player needs to act if they haven't acted yet, or if they need to match a new raise
    if (!playersActed.has(idx) || p.currentBet < currentBet) {
      return idx;
    }
  }
  return -1;
}

function countActivePlayers(players: HandPlayerState[]): number {
  return players.filter(p => !p.hasFolded).length;
}

function countPlayersCanAct(players: HandPlayerState[]): number {
  return players.filter(p => !p.hasFolded && !p.isAllIn).length;
}

export function createBettingRound(
  players: HandPlayerState[],
  dealerSeatIndex: number,
  currentBet: number,
  isPreflop: boolean = false
): BettingRoundState {
  const playersActed = new Set<number>();

  // Mark players who can't act (folded/all-in) as already acted
  for (const p of players) {
    if (p.hasFolded || p.isAllIn) {
      playersActed.add(p.seatIndex);
    }
  }

  // In preflop, SB and BB have already posted blinds — mark them as acted
  // but they can still re-act if raised. The first actor is UTG (seat after BB).
  let firstActorStart: number;
  if (isPreflop) {
    // SB is dealerSeatIndex + 1, BB is dealerSeatIndex + 2
    // First to act preflop is UTG = dealerSeatIndex + 3
    firstActorStart = (dealerSeatIndex + 2) % NUM_SEATS; // start search from BB
  } else {
    // Postflop: first to act is SB (dealerSeatIndex + 1), or next active
    firstActorStart = dealerSeatIndex;
  }

  const actorIndex = findNextActor(players, firstActorStart, playersActed, currentBet, isPreflop);

  // Check if round is already complete (0 or 1 players can act)
  const canAct = countPlayersCanAct(players);
  const active = countActivePlayers(players);
  const isComplete = actorIndex === -1 || canAct === 0 || active <= 1;

  return {
    currentBetToMatch: currentBet,
    minRaise: currentBet > 0 ? currentBet : 1, // min raise is 1 BB (big blind)
    lastRaiseAmount: currentBet > 0 ? currentBet : 1,
    actorIndex: isComplete ? -1 : actorIndex,
    playersActed,
    isComplete,
  };
}

export function processAction(
  state: BettingRoundState,
  players: HandPlayerState[],
  seatIndex: number,
  actionType: ActionType,
  amount: number,
  dealerSeatIndex: number
): BettingRoundState {
  const newActed = new Set(state.playersActed);
  newActed.add(seatIndex);

  let newBet = state.currentBetToMatch;
  let newMinRaise = state.minRaise;
  let newLastRaise = state.lastRaiseAmount;

  switch (actionType) {
    case 'fold':
    case 'check':
      // No change to bet levels
      break;

    case 'call':
      // Player matches current bet — no change to bet level
      break;

    case 'bet':
    case 'raise': {
      const raiseBy = amount - state.currentBetToMatch;
      if (raiseBy > 0) {
        // A new raise resets who has acted — everyone else needs to respond
        newBet = amount;
        newLastRaise = raiseBy;
        newMinRaise = raiseBy;
        // Clear acted set except for folded/all-in players and current actor
        newActed.clear();
        for (const p of players) {
          if (p.hasFolded || p.isAllIn) {
            newActed.add(p.seatIndex);
          }
        }
        newActed.add(seatIndex);
      }
      break;
    }

    case 'all_in': {
      // All-in might be a raise or just a call/short
      if (amount > state.currentBetToMatch) {
        const raiseBy = amount - state.currentBetToMatch;
        // Only counts as a full raise if it meets minimum raise
        if (raiseBy >= state.minRaise) {
          newBet = amount;
          newLastRaise = raiseBy;
          newMinRaise = raiseBy;
          newActed.clear();
          for (const p of players) {
            if (p.hasFolded || p.isAllIn) {
              newActed.add(p.seatIndex);
            }
          }
          newActed.add(seatIndex);
        } else {
          // Short all-in — doesn't reopen action
          newBet = amount;
        }
      }
      break;
    }

    case 'post_sb':
    case 'post_bb':
      // Blind posting — don't mark as having acted (they get option to raise)
      newActed.delete(seatIndex);
      newBet = Math.max(newBet, amount);
      break;
  }

  // Update the player state for folded/all-in
  const updatedPlayers = players.map(p => {
    if (p.seatIndex === seatIndex) {
      if (actionType === 'fold') return { ...p, hasFolded: true };
      if (actionType === 'all_in') return { ...p, isAllIn: true };
    }
    return p;
  });

  // Find next actor
  const nextActor = findNextActor(updatedPlayers, seatIndex, newActed, newBet, false);
  const canAct = countPlayersCanAct(updatedPlayers);
  const active = countActivePlayers(updatedPlayers);

  const isComplete = nextActor === -1 || canAct === 0 || active <= 1;

  // Suppress lint for unused param
  void dealerSeatIndex;

  return {
    currentBetToMatch: newBet,
    minRaise: newMinRaise,
    lastRaiseAmount: newLastRaise,
    actorIndex: isComplete ? -1 : nextActor,
    playersActed: newActed,
    isComplete,
  };
}

export function isRoundComplete(state: BettingRoundState): boolean {
  return state.isComplete;
}
