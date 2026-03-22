import type { ActionType, AvailableActions, Player, ActionRecord, Street } from '../types';

/**
 * Tracks the state of a single betting round (street).
 */
export interface BettingRoundState {
  street: Street;
  currentBet: number;
  minRaise: number;
  lastRaiseSize: number;
  actionCount: number;
  /** Index of the last aggressor (who bet/raised) */
  lastAggressorIndex: number | null;
  /** Set of player indices who have acted this round */
  actedPlayers: Set<number>;
  /** Whether the round is complete */
  isComplete: boolean;
}

export function createBettingRound(street: Street, bigBlind: number): BettingRoundState {
  return {
    street,
    currentBet: street === 'preflop' ? bigBlind : 0,
    minRaise: bigBlind,
    lastRaiseSize: bigBlind,
    actionCount: 0,
    lastAggressorIndex: null,
    actedPlayers: new Set(),
    isComplete: false,
  };
}

/**
 * Get the legally available actions for a player.
 */
export function getAvailableActions(
  player: Player,
  roundState: BettingRoundState,
  potSize: number,
  _players: Player[]
): AvailableActions {
  const actions: AvailableActions['actions'] = [];
  const amountToCall = roundState.currentBet - player.currentBet;
  const canCheck = amountToCall === 0;
  const canCall = amountToCall > 0 && player.chipStack > 0;
  const minRaiseTotal = roundState.currentBet + roundState.minRaise;
  const canRaise = player.chipStack > amountToCall;

  // Fold — always available if facing a bet
  actions.push({
    actionType: 'fold',
    isAvailable: amountToCall > 0,
  });

  // Check — available if no bet to call
  actions.push({
    actionType: 'check',
    isAvailable: canCheck,
  });

  // Call — available if facing a bet
  const effectiveCallAmount = Math.min(amountToCall, player.chipStack);
  actions.push({
    actionType: 'call',
    isAvailable: canCall,
    callAmount: effectiveCallAmount,
  });

  // Bet — available if no current bet (preflop is special — BB is a forced bet)
  actions.push({
    actionType: 'bet',
    isAvailable: !canCall && canRaise && roundState.currentBet === 0,
    minRaise: roundState.minRaise,
    maxRaise: player.chipStack,
    suggestedSizings: generateSizings(potSize, roundState.minRaise, player.chipStack, 'bet'),
  });

  // Raise — available if facing a bet and have enough chips
  actions.push({
    actionType: 'raise',
    isAvailable: canRaise && amountToCall > 0,
    callAmount: effectiveCallAmount,
    minRaise: Math.min(minRaiseTotal, player.chipStack + player.currentBet),
    maxRaise: player.chipStack + player.currentBet,
    suggestedSizings: generateSizings(potSize + amountToCall, roundState.minRaise, player.chipStack - amountToCall, 'raise'),
  });

  // All-in — always available if player has chips
  actions.push({
    actionType: 'all_in',
    isAvailable: player.chipStack > 0,
    callAmount: player.chipStack,
  });

  // Pot odds
  const totalPot = potSize + amountToCall;
  const potOdds = amountToCall > 0
    ? `${(totalPot / amountToCall).toFixed(1)}:1`
    : undefined;

  return {
    actions,
    potOdds,
    potSize,
  };
}

/**
 * Validate and process a player action. Returns the action record or throws if invalid.
 */
export function processAction(
  playerIndex: number,
  players: Player[],
  action: { actionType: ActionType; amount?: number },
  roundState: BettingRoundState,
  potSize: number,
  actionTimestamp: number
): { updatedRound: BettingRoundState; actionRecord: ActionRecord } {
  const player = players[playerIndex];
  const amountToCall = roundState.currentBet - player.currentBet;

  switch (action.actionType) {
    case 'fold': {
      player.isFolded = true;
      player.isActive = false;
      break;
    }

    case 'check': {
      if (amountToCall > 0) {
        throw new Error(`Cannot check — must call ${amountToCall} or fold`);
      }
      break;
    }

    case 'call': {
      const callAmount = Math.min(amountToCall, player.chipStack);
      player.chipStack -= callAmount;
      player.currentBet += callAmount;
      if (player.chipStack === 0) {
        player.isAllIn = true;
      }
      break;
    }

    case 'bet': {
      const betAmount = action.amount ?? roundState.minRaise;
      if (roundState.currentBet > 0) {
        throw new Error('Cannot bet — there is already a bet. Use raise instead.');
      }
      if (betAmount < roundState.minRaise && betAmount < player.chipStack) {
        throw new Error(`Bet must be at least ${roundState.minRaise}`);
      }
      const effectiveBet = Math.min(betAmount, player.chipStack);
      player.chipStack -= effectiveBet;
      player.currentBet = effectiveBet;
      roundState.currentBet = effectiveBet;
      roundState.lastRaiseSize = effectiveBet;
      roundState.minRaise = effectiveBet;
      roundState.lastAggressorIndex = playerIndex;
      roundState.actedPlayers = new Set([playerIndex]); // reset — others need to act again
      if (player.chipStack === 0) player.isAllIn = true;
      break;
    }

    case 'raise': {
      const raiseTotal = action.amount ?? (roundState.currentBet + roundState.minRaise);
      const raiseAmount = raiseTotal - player.currentBet;
      if (raiseAmount > player.chipStack) {
        // Treat as all-in
        player.chipStack = 0;
        player.currentBet += player.chipStack;
        player.isAllIn = true;
      } else {
        const actualRaiseSize = raiseTotal - roundState.currentBet;
        if (actualRaiseSize < roundState.minRaise && raiseAmount < player.chipStack) {
          throw new Error(`Raise must be at least ${roundState.currentBet + roundState.minRaise}`);
        }
        player.chipStack -= raiseAmount;
        player.currentBet = raiseTotal;
        roundState.lastRaiseSize = actualRaiseSize;
        roundState.minRaise = Math.max(roundState.minRaise, actualRaiseSize);
        roundState.currentBet = raiseTotal;
        roundState.lastAggressorIndex = playerIndex;
        // Reset acted — everyone except raiser needs to act
        roundState.actedPlayers = new Set([playerIndex]);
        if (player.chipStack === 0) player.isAllIn = true;
      }
      break;
    }

    case 'all_in': {
      const allInAmount = player.chipStack;
      const newTotal = player.currentBet + allInAmount;

      if (newTotal > roundState.currentBet) {
        // This is a raise
        const raiseSize = newTotal - roundState.currentBet;
        if (raiseSize >= roundState.minRaise) {
          roundState.minRaise = raiseSize;
          roundState.lastAggressorIndex = playerIndex;
          roundState.actedPlayers = new Set([playerIndex]);
        }
        roundState.currentBet = newTotal;
        roundState.lastRaiseSize = raiseSize;
      }

      player.currentBet = newTotal;
      player.chipStack = 0;
      player.isAllIn = true;
      break;
    }
  }

  roundState.actionCount++;
  if (action.actionType !== 'bet' && action.actionType !== 'raise' && action.actionType !== 'all_in') {
    roundState.actedPlayers.add(playerIndex);
  }

  const actionRecord: ActionRecord = {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    actionType: action.actionType,
    amount: action.actionType === 'fold' || action.actionType === 'check' ? undefined : (action.amount ?? player.currentBet),
    street: roundState.street,
    potAfterAction: potSize + players.reduce((s, p) => s + p.currentBet, 0),
    timestamp: actionTimestamp,
  };

  return { updatedRound: roundState, actionRecord };
}

/**
 * Determine the next player to act. Returns -1 if the round is complete.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  players: Player[],
  roundState: BettingRoundState
): number {
  const n = players.length;
  const activePlayers = players.filter(p => !p.isFolded && !p.isAllIn);

  // If only one active player remaining (all others folded), round is done
  if (activePlayers.length <= 1) return -1;

  // Find next eligible player
  for (let offset = 1; offset <= n; offset++) {
    const idx = (currentIndex + offset) % n;
    const p = players[idx];

    if (p.isFolded || p.isAllIn) continue;

    // If this player hasn't acted yet, or there was a raise after their last action
    if (!roundState.actedPlayers.has(idx)) {
      return idx;
    }
  }

  // All active players have acted
  return -1;
}

/**
 * Check if only one player remains (everyone else folded).
 */
export function isEveryoneFolded(players: Player[]): boolean {
  return players.filter(p => !p.isFolded).length <= 1;
}

// ─── Helpers ────────────────────────────────────────────────────

function generateSizings(
  pot: number,
  minBet: number,
  maxBet: number,
  _type: 'bet' | 'raise'
): Array<{ label: string; amount: number }> {
  if (maxBet <= 0) return [];

  const sizings: Array<{ label: string; amount: number }> = [];

  const third = Math.round(pot * 0.33);
  const half = Math.round(pot * 0.5);
  const twoThirds = Math.round(pot * 0.67);
  const full = Math.round(pot);

  if (third >= minBet && third <= maxBet) {
    sizings.push({ label: '1/3 Pot', amount: third });
  }
  if (half >= minBet && half <= maxBet) {
    sizings.push({ label: '1/2 Pot', amount: half });
  }
  if (twoThirds >= minBet && twoThirds <= maxBet) {
    sizings.push({ label: '2/3 Pot', amount: twoThirds });
  }
  if (full >= minBet && full <= maxBet) {
    sizings.push({ label: 'Pot', amount: full });
  }

  return sizings;
}
