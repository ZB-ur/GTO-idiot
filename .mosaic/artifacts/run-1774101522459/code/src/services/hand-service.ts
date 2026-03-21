// ============================================================
// Hand Service — Hand lifecycle, actions, settlement
// ============================================================

import type {
  HandState,
  AvailableActions,
  PlayerAction,
  ActionResult,
  BotActionResult,
  HandSettlement,
  Player,
} from '../types';
import type { HandHistory, SeatRecord } from '../types';
import { GameEngine } from '../engine';
import { computeBotAction, type DecisionContext } from '../bot';
import { handHistoryRepository } from '../persistence';
import { getSession, updateSession, ServiceError } from './session-service';

// ============================================================
// In-memory engine registry (one per active session)
// ============================================================

const engineRegistry = new Map<string, GameEngine>();

export function getEngine(sessionId: string): GameEngine | undefined {
  return engineRegistry.get(sessionId);
}

export function setEngine(sessionId: string, engine: GameEngine): void {
  engineRegistry.set(sessionId, engine);
}

export function removeEngine(sessionId: string): void {
  engineRegistry.delete(sessionId);
}

// ============================================================
// Hand lifecycle
// ============================================================

export async function startHand(sessionId: string): Promise<HandState> {
  const session = await getSession(sessionId);

  if (session.status !== 'active') {
    throw new ServiceError('INVALID_STATE', 'Session is not active');
  }

  let engine = engineRegistry.get(sessionId);
  if (!engine) {
    const humanPlayer = session.players.find((p) => p.isHuman);
    if (!humanPlayer) {
      throw new ServiceError('NO_HUMAN_PLAYER', 'Session has no human player');
    }

    engine = new GameEngine({
      sessionId,
      players: session.players,
      blinds: session.blinds,
      dealerSeat: session.dealerSeat,
      handCount: session.handCount,
      humanSeat: humanPlayer.seat,
    });
    engineRegistry.set(sessionId, engine);
  }

  const handState = engine.startHand();

  // Update session
  session.handCount = engine.getHandCount();
  session.currentHandId = handState.id;
  session.dealerSeat = engine.getDealerSeat();

  // Update player positions from the hand state
  for (const hp of handState.players) {
    const sp = session.players.find((p) => p.seat === hp.seat);
    if (sp) {
      sp.position = hp.position;
    }
  }

  await updateSession(session);
  return handState;
}

export function getHandState(handId: string): HandState {
  const engine = findEngineByHandId(handId);
  if (!engine) {
    throw new ServiceError('HAND_NOT_FOUND', `No active hand with ID ${handId}`);
  }
  return engine.getHandState();
}

export function getAvailableActions(handId: string): AvailableActions {
  const engine = findEngineByHandId(handId);
  if (!engine) {
    throw new ServiceError('HAND_NOT_FOUND', `No active hand with ID ${handId}`);
  }
  return engine.getAvailableActions();
}

// ============================================================
// Action submission
// ============================================================

export async function submitAction(
  handId: string,
  action: PlayerAction,
): Promise<ActionResult> {
  const engine = findEngineByHandId(handId);
  if (!engine) {
    throw new ServiceError('HAND_NOT_FOUND', `No active hand with ID ${handId}`);
  }

  const result = engine.submitAction(action);

  // If hand is complete after this action, auto-settle
  if (result.isHandComplete) {
    // Settlement will be triggered explicitly by settleHand
  }

  return result;
}

export async function requestBotAction(
  handId: string,
): Promise<BotActionResult> {
  const engine = findEngineByHandId(handId);
  if (!engine) {
    throw new ServiceError('HAND_NOT_FOUND', `No active hand with ID ${handId}`);
  }

  const state = engine.getHandState();
  if (state.currentActingSeat === null) {
    throw new ServiceError('NO_ACTOR', 'No player to act');
  }

  // Find the bot player
  const sessionId = state.sessionId;
  const session = await getSession(sessionId);
  const botPlayer = session.players.find((p) => p.seat === state.currentActingSeat);

  if (!botPlayer || botPlayer.isHuman) {
    throw new ServiceError('NOT_A_BOT', 'Current player is not a BOT');
  }

  if (!botPlayer.botStyle) {
    throw new ServiceError('NO_BOT_STYLE', 'BOT player has no style configured');
  }

  // Build decision context
  const handPlayer = state.players.find((p) => p.seat === state.currentActingSeat)!;
  const availableActions = engine.getAvailableActions();
  const holeCards = engine.getAllHoleCards().get(botPlayer.seat) ?? [];
  const actionLog = engine.getActionLog();

  // Determine if facing raise
  const currentStreetActions = actionLog.filter((a) => a.street === getCurrentStreet(state));
  const facingRaise = currentStreetActions.some(
    (a) => (a.action === 'raise' || a.action === 'bet') && a.seat !== botPlayer.seat,
  );

  // Check if bot was preflop aggressor
  const preflopActions = actionLog.filter((a) => a.street === 'preflop');
  const lastPreflopRaiser = [...preflopActions]
    .reverse()
    .find((a) => a.action === 'raise' || a.action === 'bet');
  const isPreflopAggressor = lastPreflopRaiser?.seat === botPlayer.seat;

  // Calculate pot and call amount
  const totalPot = state.pots.reduce((sum, p) => sum + p.amount, 0);
  const callAction = availableActions.actions.find((a) => a.type === 'call');
  const toCallBB = callAction?.callAmount ?? 0;

  const ctx: DecisionContext = {
    player: handPlayer,
    botStyle: botPlayer.botStyle,
    holeCards,
    communityCards: state.communityCards,
    position: handPlayer.position,
    street: getCurrentStreet(state),
    potBB: totalPot,
    toCallBB,
    legalActions: availableActions.actions,
    activePlayers: state.players.filter((p) => p.isActive).length,
    facingRaise,
    isPreflopAggressor,
    bigBlind: session.blinds.bigBlind,
  };

  const decision = computeBotAction(ctx);
  const result = engine.submitAction(decision.action);

  return {
    handState: result.handState,
    actionLog: result.actionLog,
    botDecision: {
      seat: botPlayer.seat,
      botStyle: botPlayer.botStyle,
      action: decision.action.type,
      amount: decision.action.amount ?? null,
    },
    isHandComplete: result.isHandComplete,
    nextActorIsBot: result.nextActorIsBot,
  };
}

// ============================================================
// Settlement
// ============================================================

export async function settleHand(handId: string): Promise<HandSettlement> {
  const engine = findEngineByHandId(handId);
  if (!engine) {
    throw new ServiceError('HAND_NOT_FOUND', `No active hand with ID ${handId}`);
  }

  const settlement = engine.settleHand();
  const state = engine.getFullHandState();
  const sessionId = state.sessionId;
  const session = await getSession(sessionId);

  // Build hand history record
  const allHoleCards = engine.getAllHoleCards();
  const actionLog = engine.getActionLog();

  const seats: SeatRecord[] = session.players.map((player) => ({
    seat: player.seat,
    name: player.name,
    position: player.position,
    isHuman: player.isHuman,
    botStyle: player.botStyle,
    startingStackBB: findStartingStack(player, settlement),
    holeCards: allHoleCards.get(player.seat) ?? [],
  }));

  const handHistory: HandHistory = {
    id: handId,
    sessionId,
    timestamp: new Date().toISOString(),
    handNumber: session.handCount,
    dealerSeat: state.dealerSeat,
    blinds: session.blinds,
    seats,
    communityCards: state.communityCards,
    actionSequence: actionLog,
    settlement,
  };

  // Persist hand history
  await handHistoryRepository.save(handHistory);

  // Update session player stacks
  for (const fs of settlement.playerFinalStacks) {
    const player = session.players.find((p) => p.seat === fs.seat);
    if (player) {
      player.stackBB = fs.stackBB;
    }
  }
  await updateSession(session);

  return settlement;
}

// ============================================================
// Helpers
// ============================================================

function findEngineByHandId(handId: string): GameEngine | undefined {
  for (const engine of engineRegistry.values()) {
    if (engine.getCurrentHandId() === handId) {
      return engine;
    }
  }
  return undefined;
}

function getCurrentStreet(state: HandState): 'preflop' | 'flop' | 'turn' | 'river' {
  const phase = state.phase;
  if (phase === 'showdown' || phase === 'settled') return 'river';
  return phase as 'preflop' | 'flop' | 'turn' | 'river';
}

function findStartingStack(player: Player, settlement: HandSettlement): number {
  const finalStack = settlement.playerFinalStacks.find((fs) => fs.seat === player.seat);
  const chipMove = settlement.chipMovements.find((cm) => cm.seat === player.seat);

  if (finalStack && chipMove) {
    return finalStack.stackBB - chipMove.changesBB;
  }
  return player.stackBB;
}
