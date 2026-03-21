// ============================================================
// Session Service — Session lifecycle operations
// ============================================================

import type {
  Session,
  SessionSummary,
  SessionEndSummary,
  CreateSessionRequest,
  Player,
  BotStyle,
  Position,
} from '../types';
import {
  DEFAULT_BLINDS,
  DEFAULT_STARTING_STACK_BB,
  MAX_PLAYERS,
  POSITIONS,
} from '../types';
import { sessionRepository } from '../persistence';
import { handHistoryRepository } from '../persistence';
import { generateBotName } from '../bot';

// ============================================================
// Session creation
// ============================================================

const BOT_STYLES: BotStyle[] = ['TAG', 'LAG', 'TP', 'LP', 'GTO'];

function pickBotStyles(count: number): BotStyle[] {
  const styles: BotStyle[] = [];
  for (let i = 0; i < count; i++) {
    styles.push(BOT_STYLES[i % BOT_STYLES.length]);
  }
  // Shuffle
  for (let i = styles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [styles[i], styles[j]] = [styles[j], styles[i]];
  }
  return styles;
}

function assignPositions(dealerSeat: number): Map<number, Position> {
  const posMap = new Map<number, Position>();
  // Position assignment: BTN at dealer, then SB, BB, UTG, MP, CO
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const seat = (dealerSeat + i) % MAX_PLAYERS;
    posMap.set(seat, POSITIONS[i]);
  }
  return posMap;
}

export async function createSession(
  request: CreateSessionRequest,
): Promise<Session> {
  // Check for existing active session
  const existing = await sessionRepository.getActive();
  if (existing) {
    throw new ServiceError('SESSION_CONFLICT', 'An active session already exists');
  }

  // Determine human seat
  let humanSeat: number;
  if (request.seatPreference === 'manual' && request.selectedSeat != null) {
    humanSeat = Math.max(0, Math.min(request.selectedSeat, MAX_PLAYERS - 1));
  } else {
    humanSeat = Math.floor(Math.random() * MAX_PLAYERS);
  }

  // Random initial dealer
  const dealerSeat = Math.floor(Math.random() * MAX_PLAYERS);
  const positionMap = assignPositions(dealerSeat);
  const botStyles = pickBotStyles(MAX_PLAYERS - 1);

  // Build player array
  const players: Player[] = [];
  let botIdx = 0;

  for (let seat = 0; seat < MAX_PLAYERS; seat++) {
    if (seat === humanSeat) {
      players.push({
        seat,
        name: 'You',
        isHuman: true,
        botStyle: null,
        stackBB: DEFAULT_STARTING_STACK_BB,
        position: positionMap.get(seat)!,
        isActive: true,
        isSittingOut: false,
      });
    } else {
      const style = botStyles[botIdx++];
      players.push({
        seat,
        name: generateBotName(style, seat),
        isHuman: false,
        botStyle: style,
        stackBB: DEFAULT_STARTING_STACK_BB,
        position: positionMap.get(seat)!,
        isActive: true,
        isSittingOut: false,
      });
    }
  }

  const session: Session = {
    id: crypto.randomUUID(),
    status: 'active',
    players,
    blinds: { ...DEFAULT_BLINDS },
    startedAt: new Date().toISOString(),
    pausedAt: null,
    endedAt: null,
    handCount: 0,
    currentHandId: null,
    dealerSeat,
  };

  await sessionRepository.create(session);
  return session;
}

// ============================================================
// Session queries
// ============================================================

export async function getActiveSession(): Promise<Session | null> {
  const session = await sessionRepository.getActive();
  return session ?? null;
}

export async function getSession(sessionId: string): Promise<Session> {
  const session = await sessionRepository.getById(sessionId);
  if (!session) {
    throw new ServiceError('SESSION_NOT_FOUND', `No session found with ID ${sessionId}`);
  }
  return session;
}

export async function listSessions(): Promise<{ sessions: SessionSummary[]; total: number }> {
  return sessionRepository.listAll();
}

// ============================================================
// Session lifecycle
// ============================================================

export async function pauseSession(sessionId: string): Promise<Session> {
  const session = await getSession(sessionId);

  if (session.status !== 'active') {
    throw new ServiceError('INVALID_STATE', 'Session is not in a pausable state');
  }

  session.status = 'paused';
  session.pausedAt = new Date().toISOString();
  await sessionRepository.update(session);
  return session;
}

export async function resumeSession(sessionId: string): Promise<Session> {
  const session = await getSession(sessionId);

  if (session.status !== 'paused') {
    throw new ServiceError('INVALID_STATE', 'Session is not paused');
  }

  session.status = 'active';
  session.pausedAt = null;
  await sessionRepository.update(session);
  return session;
}

export async function endSession(sessionId: string): Promise<SessionEndSummary> {
  const session = await getSession(sessionId);
  const endedAt = new Date().toISOString();

  session.status = 'completed';
  session.endedAt = endedAt;

  // Calculate profit/loss from hand histories
  const handRecords = await handHistoryRepository.getAllBySession(sessionId);
  let profitLossBB = 0;
  let totalEvLoss = 0;
  let handsWithEv = 0;

  for (const record of handRecords) {
    profitLossBB += record.profitLossBB;
    // EV loss placeholder — will be populated when GTO batch eval is integrated
    handsWithEv++;
  }

  await sessionRepository.update(session, profitLossBB);

  const startTime = new Date(session.startedAt).getTime();
  const endTime = new Date(endedAt).getTime();
  const durationMinutes = Math.round((endTime - startTime) / 60000 * 10) / 10;

  return {
    sessionId,
    startedAt: session.startedAt,
    endedAt,
    durationMinutes,
    handCount: session.handCount,
    profitLossBB: Math.round(profitLossBB * 100) / 100,
    avgEvLossPerHand: handsWithEv > 0
      ? Math.round((totalEvLoss / handsWithEv) * 100) / 100
      : 0,
  };
}

// ============================================================
// Session update helper (used by hand-service)
// ============================================================

export async function updateSession(session: Session, profitLossBB?: number): Promise<void> {
  await sessionRepository.update(session, profitLossBB);
}

// ============================================================
// Error helper
// ============================================================

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
