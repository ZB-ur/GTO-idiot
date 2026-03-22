import { v4 as uuidv4 } from 'uuid';
import type {
  BlindStructure,
  Player,
  Position,
  Session,
  SessionEndSummary,
  SessionState,
  ListSessionsParams,
  ListSessionsResult,
  AppError,
} from '../types';
import { DEFAULT_BLINDS, PLAYER_COUNT, STARTING_STACK_BB } from '../types';
import { sessionRepository, handRepository, sessionStateRepository } from '../persistence';

/** Positions assigned around a 6-max table starting from BTN. */
const TABLE_POSITIONS: Position[] = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];

/** Bot display names keyed by position. */
const BOT_NAMES: Record<Position, string> = {
  UTG: 'BOT-UTG',
  HJ: 'BOT-HJ',
  CO: 'BOT-CO',
  BTN: 'BOT-BTN',
  SB: 'BOT-SB',
  BB: 'BOT-BB',
};

function createError(code: AppError['code'], message: string, details?: Record<string, unknown>): AppError {
  return { code, message, details };
}

/**
 * Initialize 6 players: 1 human at a random seat, 5 bots.
 */
function initializePlayers(humanSeatIndex: number, blinds: BlindStructure): Player[] {
  const startingStack = STARTING_STACK_BB * blinds.bigBlind;
  const players: Player[] = [];

  for (let i = 0; i < PLAYER_COUNT; i++) {
    const position = TABLE_POSITIONS[i]; // will be re-assigned by engine per hand
    const isHuman = i === humanSeatIndex;
    players.push({
      id: isHuman ? 'human' : `bot-${i}`,
      name: isHuman ? 'Player' : BOT_NAMES[position],
      position,
      chipStack: startingStack,
      isBot: !isHuman,
      isActive: true,
      currentBet: 0,
      isFolded: false,
      isAllIn: false,
      isDealer: false,
    });
  }

  return players;
}

/**
 * Session lifecycle service.
 *
 * Manages creating, ending, listing, and recovering sessions.
 * Delegates persistence to the repository layer.
 */
export const sessionService = {
  // ────────────────────────────────────────────────────────
  // Create
  // ────────────────────────────────────────────────────────

  /**
   * Start a new game session with 6 players (1 human + 5 bots).
   * Each player starts with 100 BB. The human receives a random seat.
   */
  async createSession(blinds?: BlindStructure): Promise<Session> {
    const effectiveBlinds = blinds ?? DEFAULT_BLINDS;
    const humanSeatIndex = Math.floor(Math.random() * PLAYER_COUNT);
    const dealerIndex = Math.floor(Math.random() * PLAYER_COUNT);

    const players = initializePlayers(humanSeatIndex, effectiveBlinds);
    players[dealerIndex].isDealer = true;

    const session: Session = {
      id: uuidv4(),
      status: 'active',
      startedAt: new Date().toISOString(),
      players,
      blinds: effectiveBlinds,
      handCount: 0,
      humanPlayerIndex: humanSeatIndex,
      dealerIndex,
    };

    await sessionRepository.create(session);

    // Persist initial session state for crash recovery
    const initialState: SessionState = {
      sessionId: session.id,
      status: 'active',
      players: session.players,
      currentHandState: null,
    };
    await sessionStateRepository.save(initialState);

    return session;
  },

  // ────────────────────────────────────────────────────────
  // End
  // ────────────────────────────────────────────────────────

  /**
   * End an active session. Computes final statistics.
   * Throws if session not found or already ended.
   */
  async endSession(sessionId: string): Promise<SessionEndSummary> {
    const session = await sessionRepository.getById(sessionId);

    if (session.status === 'completed') {
      throw createError('SESSION_ENDED', `Session ${sessionId} is already ended`);
    }

    const endedAt = new Date().toISOString();
    const hands = await handRepository.getAllBySession(sessionId);

    // Compute stats
    let netProfitLossBB = 0;
    let biggestWin = 0;
    let biggestLoss = 0;

    for (const hand of hands) {
      const humanNet = hand.result.humanNetResult ?? 0;
      netProfitLossBB += humanNet;
      if (humanNet > biggestWin) biggestWin = humanNet;
      if (humanNet < biggestLoss) biggestLoss = humanNet;
    }

    // Duration in seconds
    const startMs = new Date(session.startedAt).getTime();
    const endMs = new Date(endedAt).getTime();
    const duration = Math.round((endMs - startMs) / 1000);

    // GTO conformance placeholder (computed by review module)
    const gtoConformance = 100;

    // Update session record
    const updatedSession: Session = {
      ...session,
      status: 'completed',
      endedAt,
    };
    await sessionRepository.update(updatedSession);

    // Clean up session state (no longer needed for crash recovery)
    await sessionStateRepository.delete(sessionId);

    const summary: SessionEndSummary = {
      sessionId,
      handsPlayed: hands.length,
      netProfitLossBB,
      gtoConformance,
      duration,
      biggestWin: biggestWin > 0 ? biggestWin : undefined,
      biggestLoss: biggestLoss < 0 ? biggestLoss : undefined,
    };

    return summary;
  },

  // ────────────────────────────────────────────────────────
  // Get / List
  // ────────────────────────────────────────────────────────

  /**
   * Get a session by ID.
   */
  async getSession(sessionId: string): Promise<Session> {
    return sessionRepository.getById(sessionId);
  },

  /**
   * List sessions with pagination and sorting.
   */
  async listSessions(params?: ListSessionsParams): Promise<ListSessionsResult> {
    return sessionRepository.list(params);
  },

  /**
   * Delete a session and all associated data.
   */
  async deleteSession(sessionId: string): Promise<void> {
    return sessionRepository.delete(sessionId);
  },

  // ────────────────────────────────────────────────────────
  // Session State (crash recovery)
  // ────────────────────────────────────────────────────────

  /**
   * Get the current session state for crash recovery.
   */
  async getSessionState(sessionId: string): Promise<SessionState> {
    return sessionStateRepository.getBySessionId(sessionId);
  },

  /**
   * Save/update session state. Called after every game action.
   */
  async saveSessionState(state: SessionState): Promise<void> {
    await sessionStateRepository.save(state);
  },

  /**
   * Check for a recoverable active session (e.g., after browser crash).
   * Returns the active session state if one exists, or null.
   */
  async findRecoverableSession(): Promise<SessionState | null> {
    return sessionStateRepository.findActive();
  },

  /**
   * Recover a session after a crash. Returns the session and its last saved state.
   * If the session or state cannot be found, returns null.
   */
  async recoverSession(sessionId: string): Promise<{ session: Session; state: SessionState } | null> {
    try {
      const [session, state] = await Promise.all([
        sessionRepository.getById(sessionId),
        sessionStateRepository.getBySessionId(sessionId),
      ]);

      if (session.status !== 'active') {
        return null;
      }

      return { session, state };
    } catch {
      return null;
    }
  },

  // ────────────────────────────────────────────────────────
  // Player state updates (used by game service)
  // ────────────────────────────────────────────────────────

  /**
   * Update the session's hand count and dealer index after a hand completes.
   * Also rotates the dealer button.
   */
  async advanceSession(sessionId: string): Promise<Session> {
    const session = await sessionRepository.getById(sessionId);

    const updatedSession: Session = {
      ...session,
      handCount: session.handCount + 1,
      dealerIndex: (session.dealerIndex + 1) % PLAYER_COUNT,
    };

    // Update dealer flags on players
    updatedSession.players = updatedSession.players.map((p, i) => ({
      ...p,
      isDealer: i === updatedSession.dealerIndex,
    }));

    await sessionRepository.update(updatedSession);
    return updatedSession;
  },

  /**
   * Update player chip stacks in the session after a hand.
   */
  async updatePlayerStacks(sessionId: string, players: Player[]): Promise<void> {
    const session = await sessionRepository.getById(sessionId);
    const updatedSession: Session = {
      ...session,
      players: players.map((p) => ({
        ...p,
        // Reset per-hand state
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
        isActive: p.chipStack > 0,
      })),
    };
    await sessionRepository.update(updatedSession);
  },
};
