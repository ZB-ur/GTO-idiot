/**
 * Game service — orchestrates game sessions, hand lifecycle, and player actions.
 * Coordinates between the game-state engine, bot decision engine, and data layer.
 */

import type {
  ActionEntry,
  ActionResult,
  AvailableActions,
  BlindSize,
  CreateGameRequest,
  GameSession,
  HandState,
  PlayerAction,
  PlayerInfo,
  Position,
} from '../types/game';
import type { BotStyle } from '../types/bot';
import { initializeHand, applyAction, isHandComplete, getCurrentStreet } from '../engine/game-state';
import { getAvailableActions, validateAction } from '../engine/action-validator';
import { getDefaultBotLineup } from '../engine/bot/profiles';
import { selectBetSize, shouldShove } from '../engine/bot/sizing';
import { generateId, nextPosition, now } from '../engine/utils';
import { db, type StoredGameSession } from './db';
import { recordHand } from './hand-recorder';

// ─── In-memory game state ────────────────────────────────────────────

/** Active game state kept in memory (not persisted to DB until hand completes) */
interface ActiveGame {
  session: GameSession;
  currentHand: HandState | null;
  userId: string;
}

let activeGame: ActiveGame | null = null;

// ─── Game session management ─────────────────────────────────────────

/**
 * Create a new game session. Initializes 6 players (1 user + 5 bots).
 */
export async function createGame(request: CreateGameRequest): Promise<GameSession> {
  if (activeGame && activeGame.session.status === 'active') {
    throw new Error('A game session is already active. End it first.');
  }

  const startingStack = request.startingStack ?? 100;
  const blindSize: BlindSize = request.blindSize ?? { smallBlind: 0.5, bigBlind: 1 };
  const userId = generateId();
  const bots = getDefaultBotLineup();

  // Assign positions: user sits at requested position, bots fill rest
  const allPositions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const userPosIndex = allPositions.indexOf(request.seatPosition);
  let botIndex = 0;

  const players: PlayerInfo[] = allPositions.map((pos, i) => {
    if (i === userPosIndex) {
      return {
        id: userId,
        name: 'You',
        position: pos,
        stack: startingStack,
        isUser: true,
        isActive: true,
      };
    }
    const bot = bots[botIndex % bots.length]!;
    botIndex++;
    return {
      id: generateId(),
      name: bot.name,
      position: pos,
      stack: startingStack,
      isUser: false,
      isActive: true,
      botStyle: bot.style,
    };
  });

  const session: GameSession = {
    id: generateId(),
    status: 'active',
    seatPosition: request.seatPosition,
    players,
    handsPlayed: 0,
    currentHandId: null,
    blindSize,
    createdAt: now(),
  };

  // Persist session to DB
  const stored: StoredGameSession = {
    id: session.id,
    status: 'active',
    seatPosition: session.seatPosition,
    handsPlayed: 0,
    blindSize,
    createdAt: session.createdAt,
  };
  await db.sessions.put(stored);

  activeGame = { session, currentHand: null, userId };
  return session;
}

/**
 * Get the current active game session.
 */
export function getGame(gameId: string): GameSession {
  if (!activeGame || activeGame.session.id !== gameId) {
    throw new Error(`Game ${gameId} not found`);
  }
  return activeGame.session;
}

/**
 * End the current game session.
 */
export async function endGame(gameId: string): Promise<GameSession> {
  if (!activeGame || activeGame.session.id !== gameId) {
    throw new Error(`Game ${gameId} not found`);
  }

  const endedSession: GameSession = {
    ...activeGame.session,
    status: 'ended',
    currentHandId: null,
  };

  await db.sessions.update(gameId, { status: 'ended', endedAt: now() });
  activeGame = null;
  return endedSession;
}

// ─── Hand lifecycle ──────────────────────────────────────────────────

/**
 * Deal a new hand in the current game session.
 */
export async function dealNewHand(gameId: string): Promise<HandState> {
  if (!activeGame || activeGame.session.id !== gameId) {
    throw new Error(`Game ${gameId} not found`);
  }

  if (activeGame.currentHand && !isHandComplete(activeGame.currentHand)) {
    throw new Error('Previous hand is not complete');
  }

  const session = activeGame.session;
  const handNumber = session.handsPlayed + 1;

  // Rotate dealer button
  const dealerPosition = handNumber === 1
    ? 'BTN'
    : nextPosition(activeGame.currentHand?.dealerPosition ?? 'BTN');

  // Build player list from current stacks
  const playerInputs = session.players.map(p => ({
    id: p.id,
    name: p.name,
    position: p.position,
    stack: p.stack,
    isUser: p.isUser,
  }));

  const handState = initializeHand(
    gameId,
    handNumber,
    playerInputs,
    dealerPosition,
    session.blindSize,
    activeGame.userId,
  );

  activeGame.currentHand = handState;

  // Update session
  activeGame.session = {
    ...session,
    handsPlayed: handNumber,
    currentHandId: handState.id,
  };

  // If it's a bot's turn, process bot actions
  if (!handState.isUserTurn && handState.currentActorId) {
    const result = await processBotActions(handState);
    activeGame.currentHand = result;
    return result;
  }

  return handState;
}

/**
 * Get the current hand state.
 */
export function getHandState(gameId: string, handId: string): HandState {
  if (!activeGame || activeGame.session.id !== gameId) {
    throw new Error(`Game ${gameId} not found`);
  }
  if (!activeGame.currentHand || activeGame.currentHand.id !== handId) {
    throw new Error(`Hand ${handId} not found`);
  }
  return activeGame.currentHand;
}

/**
 * Get available actions for the current user.
 */
export function getPlayerAvailableActions(gameId: string, handId: string): AvailableActions {
  const handState = getHandState(gameId, handId);

  if (!activeGame) throw new Error('No active game');

  if (!handState.isUserTurn) {
    return {
      handId: handState.id,
      currentPot: handState.pot,
      userStack: 0,
      actions: [],
    };
  }

  return getAvailableActions(handState, activeGame.userId);
}

/**
 * Submit a player action. Processes the action, then advances through bot actions
 * until the next user decision or hand completion.
 */
export async function submitAction(
  gameId: string,
  handId: string,
  action: PlayerAction,
): Promise<ActionResult> {
  if (!activeGame || activeGame.session.id !== gameId) {
    throw new Error(`Game ${gameId} not found`);
  }
  if (!activeGame.currentHand || activeGame.currentHand.id !== handId) {
    throw new Error(`Hand ${handId} not found`);
  }

  const handState = activeGame.currentHand;

  if (!handState.isUserTurn) {
    throw new Error('Not your turn');
  }

  // Validate action
  const validation = validateAction(handState, activeGame.userId, action);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid action');
  }

  // Apply user action
  let currentState = applyAction(handState, activeGame.userId, action);
  const processedActions: ActionEntry[] = [];

  // Get the user's action entry from history
  const userActionEntry = currentState.actionHistory[currentState.actionHistory.length - 1];
  if (userActionEntry) {
    processedActions.push({ ...userActionEntry, isUserAction: true });
  }

  // Process bot actions until next user turn or hand complete
  if (!isHandComplete(currentState) && !currentState.isUserTurn && currentState.currentActorId) {
    const beforeLen = currentState.actionHistory.length;
    currentState = await processBotActions(currentState);
    // Collect all bot actions that were added
    for (let i = beforeLen; i < currentState.actionHistory.length; i++) {
      const entry = currentState.actionHistory[i];
      if (entry) processedActions.push(entry);
    }
  }

  activeGame.currentHand = currentState;

  // If hand is complete, record it and update session stacks
  if (isHandComplete(currentState)) {
    await finalizeHand(currentState);
  }

  return {
    handState: currentState,
    processedActions,
    handComplete: isHandComplete(currentState),
  };
}

// ─── Bot action processing ───────────────────────────────────────────

/**
 * Process bot actions sequentially until it's the user's turn or hand completes.
 */
async function processBotActions(state: HandState): Promise<HandState> {
  let currentState = state;

  while (
    !isHandComplete(currentState) &&
    !currentState.isUserTurn &&
    currentState.currentActorId
  ) {
    const botPlayer = currentState.players.find(p => p.playerId === currentState.currentActorId);
    if (!botPlayer) break;

    // Find bot style from session
    const sessionPlayer = activeGame?.session.players.find(p => p.id === botPlayer.playerId);
    const botStyle: BotStyle = sessionPlayer?.botStyle ?? 'TAG';

    const botAction = decideBotAction(currentState, botPlayer.playerId, botStyle);
    currentState = applyAction(currentState, botPlayer.playerId, botAction);
  }

  return currentState;
}

/**
 * Decide a bot's action based on style and current state.
 */
function decideBotAction(state: HandState, botPlayerId: string, style: BotStyle): PlayerAction {
  const player = state.players.find(p => p.playerId === botPlayerId);
  if (!player) return { action: 'fold' };

  const street = getCurrentStreet(state.phase);

  // Preflop decision
  if (street === 'preflop' && player.holeCards) {
    // not visible in frozen state, but engine internally has them
    // Use preflop ranges
    const raiseCount = state.actionHistory.filter(
      a => a.street === 'preflop' && (a.action === 'raise' || a.action === 'all_in'),
    ).length;
    const facingRaise = raiseCount > 0;

    // For preflop bot decisions, we use the bot's internal cards
    // Since cards aren't exposed in HandState before showdown, we'll use a simplified approach
    const highestBet = Math.max(...state.players.map(p => p.currentBet));
    const amountToCall = highestBet - player.currentBet;

    // Simplified preflop logic based on style thresholds
    const rand = Math.random();

    if (facingRaise && raiseCount >= 2) {
      // Facing 3bet+: tight range
      if (rand < 0.1) return makeRaise(state, player, style);
      if (rand < 0.3) return { action: 'call' };
      return { action: 'fold' };
    }

    if (facingRaise) {
      // Facing open raise
      const callThreshold = style === 'Fish' ? 0.6 : style === 'Maniac' ? 0.5 :
        style === 'LAG' ? 0.4 : style === 'TAG' ? 0.25 : 0.15;
      const raiseThreshold = style === 'Maniac' ? 0.25 : style === 'LAG' ? 0.15 :
        style === 'TAG' ? 0.08 : 0.05;

      if (rand < raiseThreshold) return makeRaise(state, player, style);
      if (rand < raiseThreshold + callThreshold) return { action: 'call' };
      return { action: 'fold' };
    }

    // Unopened pot
    const openThreshold = style === 'Maniac' ? 0.55 : style === 'LAG' ? 0.35 :
      style === 'Fish' ? 0.45 : style === 'TAG' ? 0.22 : 0.12;

    if (amountToCall <= 0) {
      // Can check
      if (rand < openThreshold) return makeRaise(state, player, style);
      return { action: 'check' };
    }

    if (rand < openThreshold) return makeRaise(state, player, style);
    if (rand < openThreshold + 0.15) return { action: 'call' };
    return { action: 'fold' };
  }

  // Postflop simplified decision
  return decidePostflop(state, player, style);
}

function decidePostflop(
  state: HandState,
  player: { readonly playerId: string; readonly stack: number; readonly currentBet: number; readonly position: Position },
  style: BotStyle,
): PlayerAction {
  const highestBet = Math.max(...state.players.map(p => p.currentBet));
  const amountToCall = highestBet - player.currentBet;
  const canCheck = amountToCall <= 0;
  const rand = Math.random();
  const street = getCurrentStreet(state.phase) ?? 'flop';

  // Check shove threshold
  if (shouldShove(style, player.stack, state.pot, street)) {
    if (rand < 0.4) return { action: 'all_in' };
  }

  if (canCheck) {
    // Can check or bet
    const betFreq = style === 'Maniac' ? 0.7 : style === 'LAG' ? 0.55 :
      style === 'TAG' ? 0.45 : style === 'Fish' ? 0.2 : 0.3;

    if (rand < betFreq) return makeRaise(state, player, style);
    return { action: 'check' };
  }

  // Facing a bet
  const callFreq = style === 'Fish' ? 0.65 : style === 'Maniac' ? 0.35 :
    style === 'LAG' ? 0.4 : style === 'TAG' ? 0.35 : 0.25;
  const raiseFreq = style === 'Maniac' ? 0.3 : style === 'LAG' ? 0.15 :
    style === 'TAG' ? 0.1 : style === 'Fish' ? 0.05 : 0.03;

  if (rand < raiseFreq) return makeRaise(state, player, style);
  if (rand < raiseFreq + callFreq) return { action: 'call' };
  return { action: 'fold' };
}

function makeRaise(
  state: HandState,
  player: { readonly stack: number; readonly currentBet: number },
  style: BotStyle,
): PlayerAction {
  const street = getCurrentStreet(state.phase) ?? 'preflop';
  const highestBet = Math.max(...state.players.map(p => p.currentBet));
  const minRaise = highestBet + 1; // simplified min raise
  const maxRaise = player.stack + player.currentBet;

  if (maxRaise <= minRaise) {
    return { action: 'all_in' };
  }

  const sizing = selectBetSize(style, street, state.pot, minRaise, maxRaise);
  return { action: 'raise', amount: sizing.amount };
}

// ─── Hand finalization ───────────────────────────────────────────────

async function finalizeHand(state: HandState): Promise<void> {
  if (!activeGame) return;

  // Update player stacks in session
  const updatedPlayers: PlayerInfo[] = activeGame.session.players.map(sp => {
    const handPlayer = state.players.find(p => p.playerId === sp.id);
    return {
      ...sp,
      stack: handPlayer?.stack ?? sp.stack,
    };
  });

  activeGame.session = {
    ...activeGame.session,
    players: updatedPlayers,
  };

  // Record hand to history DB
  await recordHand(state, activeGame.userId);

  // Update session in DB
  await db.sessions.update(activeGame.session.id, {
    handsPlayed: activeGame.session.handsPlayed,
  });
}

// ─── Accessors ───────────────────────────────────────────────────────

/** Get the currently active game (if any) */
export function getActiveGame(): ActiveGame | null {
  return activeGame;
}
