// ============================================================
// Session Manager — Orchestrates session lifecycle
// ============================================================
//
// Manages the full session lifecycle: creation, pause, resume,
// end. Coordinates between the game engine, persistence layer,
// and seat assignment.

import { v4 as uuidv4 } from '../utils/uuid';
import type {
  Session,
  CreateSessionRequest,
  SessionEndSummary,
  HandState,
  HandSettlement,
  ActionResult,
  AvailableActions,
  BotActionResult,
  PlayerAction,
} from '../types';
import { DEFAULT_BLINDS, DEFAULT_STARTING_STACK_BB } from '../types';
import { GameEngine } from '../engine';
import { sessionRepository } from '../persistence';
import { handHistoryRepository } from '../persistence';
import { assignSeats } from './seat-assigner';
import { computeBotAction, type DecisionContext } from '../bot';
import type { HandHistory, SeatRecord } from '../types';

// ============================================================
// Session Manager
// ============================================================

export class SessionManager {
  private engine: GameEngine | null = null;
  private session: Session | null = null;
  private humanSeat: number = 0;
  private actionLog: import('../types').ActionLogEntry[] = [];

  /** Get the current session (if any). */
  getSession(): Session | null {
    return this.session;
  }

  /** Get the game engine (if active). */
  getEngine(): GameEngine | null {
    return this.engine;
  }

  /** Get the human player's seat. */
  getHumanSeat(): number {
    return this.humanSeat;
  }

  // ============================================================
  // Session lifecycle
  // ============================================================

  /**
   * Create and start a new session.
   * Throws if an active session already exists.
   */
  async createSession(request: CreateSessionRequest): Promise<Session> {
    // Check for existing active session
    const existing = await sessionRepository.getActive();
    if (existing) {
      throw new Error('An active session already exists. End or pause it first.');
    }

    const sessionId = uuidv4();
    const dealerSeat = Math.floor(Math.random() * 6);
    const { players, humanSeat } = assignSeats(
      request.seatPreference,
      request.selectedSeat,
      dealerSeat,
    );

    this.humanSeat = humanSeat;

    const session: Session = {
      id: sessionId,
      status: 'active',
      players,
      blinds: DEFAULT_BLINDS,
      startedAt: new Date().toISOString(),
      pausedAt: null,
      endedAt: null,
      handCount: 0,
      currentHandId: null,
      dealerSeat,
    };

    // Persist to IndexedDB
    await sessionRepository.create(session);

    // Create engine
    this.engine = new GameEngine({
      sessionId,
      players: [...players],
      blinds: DEFAULT_BLINDS,
      dealerSeat,
      humanSeat,
    });

    this.session = session;
    return session;
  }

  /**
   * Resume a paused or active session from persistence.
   */
  async resumeSession(sessionId: string): Promise<Session> {
    const session = await sessionRepository.getById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (session.status === 'completed') {
      throw new Error('Cannot resume a completed session');
    }

    // Mark as active
    session.status = 'active';
    session.pausedAt = null;
    await sessionRepository.update(session);

    // Find human seat
    const humanPlayer = session.players.find((p) => p.isHuman);
    this.humanSeat = humanPlayer?.seat ?? 0;

    // Recreate engine with current state
    this.engine = new GameEngine({
      sessionId: session.id,
      players: [...session.players],
      blinds: session.blinds,
      dealerSeat: session.dealerSeat,
      handCount: session.handCount,
      humanSeat: this.humanSeat,
    });

    this.session = session;
    return session;
  }

  /**
   * Pause the current session.
   */
  async pauseSession(): Promise<Session> {
    if (!this.session) {
      throw new Error('No active session to pause');
    }
    if (this.session.status !== 'active') {
      throw new Error(`Session is ${this.session.status}, cannot pause`);
    }

    this.session.status = 'paused';
    this.session.pausedAt = new Date().toISOString();
    await sessionRepository.update(this.session);

    return this.session;
  }

  /**
   * End the current session and return summary.
   */
  async endSession(): Promise<SessionEndSummary> {
    if (!this.session) {
      throw new Error('No active session to end');
    }

    const now = new Date().toISOString();
    this.session.status = 'completed';
    this.session.endedAt = now;

    // Compute profit/loss for the human player
    const humanPlayer = this.session.players.find((p) => p.isHuman);
    const profitLossBB = humanPlayer
      ? humanPlayer.stackBB - DEFAULT_STARTING_STACK_BB
      : 0;

    await sessionRepository.update(this.session, profitLossBB);

    // Compute duration
    const startMs = new Date(this.session.startedAt).getTime();
    const endMs = new Date(now).getTime();
    const durationMinutes = (endMs - startMs) / 60_000;

    // Compute average EV loss (simplified: 0 for now, computed from history)
    // TODO: Enhance with GTO batch data from handHistoryRepository.getAllBySession()
    const avgEvLossPerHand = 0;

    const summary: SessionEndSummary = {
      sessionId: this.session.id,
      startedAt: this.session.startedAt,
      endedAt: now,
      durationMinutes: Math.round(durationMinutes * 10) / 10,
      handCount: this.session.handCount,
      profitLossBB: Math.round(profitLossBB * 100) / 100,
      avgEvLossPerHand: Math.round(avgEvLossPerHand * 100) / 100,
    };

    // Clean up
    this.engine = null;
    this.session = null;

    return summary;
  }

  // ============================================================
  // Hand lifecycle
  // ============================================================

  /**
   * Start a new hand within the current session.
   */
  startHand(): HandState {
    this.requireEngine();
    const handState = this.engine!.startHand();
    this.actionLog = [];

    // Update session
    if (this.session) {
      this.session.handCount = this.engine!.getHandCount();
      this.session.currentHandId = handState.id;
      this.session.dealerSeat = this.engine!.getDealerSeat();
      // Persist asynchronously
      void sessionRepository.update(this.session);
    }

    return handState;
  }

  /**
   * Get the current hand state.
   */
  getHandState(): HandState {
    this.requireEngine();
    return this.engine!.getHandState();
  }

  /**
   * Get available actions for the current acting player.
   */
  getAvailableActions(): AvailableActions {
    this.requireEngine();
    return this.engine!.getAvailableActions();
  }

  /**
   * Submit a player action.
   */
  submitAction(action: PlayerAction): ActionResult {
    this.requireEngine();
    const result = this.engine!.submitAction(action);
    this.actionLog.push(result.actionLog);
    return result;
  }

  /**
   * Request the BOT to compute and execute its action.
   */
  requestBotAction(): BotActionResult {
    this.requireEngine();
    const engine = this.engine!;
    const state = engine.getHandState();

    if (state.currentActingSeat === null) {
      throw new Error('No player to act');
    }

    // Find the bot player
    const botPlayer = this.session!.players.find(
      (p) => p.seat === state.currentActingSeat,
    );
    if (!botPlayer || botPlayer.isHuman) {
      throw new Error('Current player is not a BOT');
    }
    if (!botPlayer.botStyle) {
      throw new Error('BOT has no style configured');
    }

    // Get the hand player state
    const handPlayer = state.players.find(
      (p) => p.seat === state.currentActingSeat,
    );
    if (!handPlayer) {
      throw new Error('Hand player not found');
    }

    // Get legal actions
    const availableActions = engine.getAvailableActions();

    // Get bot's hole cards from the engine
    const allHoleCards = engine.getAllHoleCards();
    const botHoleCards = allHoleCards.get(botPlayer.seat) ?? [];

    // Compute total pot
    const totalPot = state.pots.reduce((sum, p) => sum + p.amount, 0);

    // Determine if facing a raise this street
    const currentStreet = state.phase as 'preflop' | 'flop' | 'turn' | 'river';
    const streetActions = this.actionLog.filter((a) => a.street === currentStreet);
    const facingRaise = streetActions.some(
      (a) => a.action === 'raise' || a.action === 'bet',
    );

    // Check if bot was preflop aggressor
    const preflopActions = this.actionLog.filter((a) => a.street === 'preflop');
    const isPreflopAggressor = preflopActions.some(
      (a) => a.seat === botPlayer.seat && (a.action === 'raise' || a.action === 'bet'),
    );

    // Find call amount
    const callAction = availableActions.actions.find((a) => a.type === 'call');
    const toCallBB = callAction?.callAmount ?? 0;

    // Count active players
    const activePlayers = state.players.filter((p) => p.isActive).length;

    const context: DecisionContext = {
      player: handPlayer,
      botStyle: botPlayer.botStyle,
      holeCards: botHoleCards,
      communityCards: state.communityCards,
      position: botPlayer.position,
      street: currentStreet,
      potBB: totalPot,
      toCallBB,
      legalActions: availableActions.actions,
      activePlayers,
      facingRaise,
      isPreflopAggressor,
      bigBlind: this.session!.blinds.bigBlind,
    };

    const decision = computeBotAction(context);

    // Submit the bot's action
    const result = engine.submitAction(decision.action);
    this.actionLog.push(result.actionLog);

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

  /**
   * Settle the current hand.
   */
  async settleHand(): Promise<HandSettlement> {
    this.requireEngine();
    const engine = this.engine!;
    const settlement = engine.settleHand();

    // Update session players' stacks
    if (this.session) {
      for (const fs of settlement.playerFinalStacks) {
        const player = this.session.players.find((p) => p.seat === fs.seat);
        if (player) {
          player.stackBB = fs.stackBB;
        }
      }
      this.session.currentHandId = null;
      void sessionRepository.update(this.session);
    }

    // Build and persist hand history
    await this.persistHandHistory(settlement);

    return settlement;
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private requireEngine(): void {
    if (!this.engine || !this.session) {
      throw new Error('No active session — create or resume a session first');
    }
  }

  private async persistHandHistory(settlement: HandSettlement): Promise<void> {
    if (!this.engine || !this.session) return;

    const engine = this.engine;
    const state = engine.getFullHandState();
    const allHoleCards = engine.getAllHoleCards();

    const seats: SeatRecord[] = this.session.players.map((player) => ({
      seat: player.seat,
      name: player.name,
      position: player.position,
      isHuman: player.isHuman,
      botStyle: player.botStyle,
      startingStackBB: DEFAULT_STARTING_STACK_BB, // Approximate — will be refined
      holeCards: allHoleCards.get(player.seat) ?? [],
    }));

    // Compute starting stacks from final stacks + chip movements
    for (const seat of seats) {
      const finalStack = settlement.playerFinalStacks.find(
        (fs) => fs.seat === seat.seat,
      );
      const chipMove = settlement.chipMovements.find(
        (cm) => cm.seat === seat.seat,
      );
      if (finalStack && chipMove) {
        // Starting stack = final stack - chip change
        // But we want starting stack of the hand, not session
        // For now use a simple approach: final - change
        seat.startingStackBB = Math.round(
          (finalStack.stackBB - chipMove.changesBB) * 100,
        ) / 100;
      }
    }

    const handHistory: HandHistory = {
      id: state.id,
      sessionId: this.session.id,
      timestamp: new Date().toISOString(),
      handNumber: engine.getHandCount(),
      dealerSeat: engine.getDealerSeat(),
      blinds: this.session.blinds,
      seats,
      communityCards: state.communityCards,
      actionSequence: [...this.actionLog],
      settlement,
    };

    await handHistoryRepository.save(handHistory);
  }
}

// ============================================================
// Singleton
// ============================================================

let defaultManager: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!defaultManager) {
    defaultManager = new SessionManager();
  }
  return defaultManager;
}

export function resetSessionManager(): void {
  defaultManager = null;
}
