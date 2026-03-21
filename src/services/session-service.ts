// ============================================================
// GTO Idiot — Session Service
// Orchestrates session lifecycle: create, pause, resume, end,
// recover, and session summary generation.
// ============================================================

import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  Session,
  SessionListResponse,
  SessionSummary,
  RecoverSessionResponse,
  SessionStatus,
  DeviationSummaryItem,
} from '../types';
import {
  createSession as dbCreateSession,
  getSession as dbGetSession,
  listSessions as dbListSessions,
  pauseSession as dbPauseSession,
  resumeSession as dbResumeSession,
  endSession as dbEndSession,
  recoverSession as dbRecoverSession,
} from '../storage/session-repository';
import {
  getAllSessionHandRecords,
} from '../storage/hand-repository';
import type { HandRecord } from '../storage/database';

// ============================================================
// Session CRUD
// ============================================================

/**
 * Create a new poker session with the given bot and blind configuration.
 */
export async function createSession(request: CreateSessionRequest): Promise<Session> {
  return dbCreateSession(request);
}

/**
 * Get session by ID.
 * @throws Error if session not found.
 */
export async function getSession(sessionId: string): Promise<Session> {
  const session = await dbGetSession(sessionId);
  if (!session) {
    throw new SessionNotFoundError(sessionId);
  }
  return session;
}

/**
 * List sessions with optional filtering.
 */
export async function listSessions(options: {
  status?: SessionStatus;
  limit?: number;
  offset?: number;
} = {}): Promise<SessionListResponse> {
  const { sessions, total } = await dbListSessions(options);
  return { sessions, total };
}

/**
 * Update session state (pause / resume / end).
 */
export async function updateSession(
  sessionId: string,
  request: UpdateSessionRequest,
): Promise<Session> {
  const session = await getSession(sessionId);

  // Validate state transitions
  validateTransition(session.status, request.action);

  let updated: Session | null;

  switch (request.action) {
    case 'pause':
      updated = await dbPauseSession(sessionId);
      break;
    case 'resume':
      updated = await dbResumeSession(sessionId);
      break;
    case 'end':
      updated = await dbEndSession(sessionId);
      break;
  }

  if (!updated) {
    throw new SessionNotFoundError(sessionId);
  }

  return updated;
}

// ============================================================
// Session Recovery
// ============================================================

/**
 * Check for unfinished sessions that can be recovered
 * (e.g., after browser tab close).
 */
export async function recoverSession(): Promise<RecoverSessionResponse> {
  return dbRecoverSession();
}

// ============================================================
// Session Summary
// ============================================================

/**
 * Generate a post-session summary with stats and key deviations.
 */
export async function getSessionSummary(sessionId: string): Promise<SessionSummary> {
  const session = await getSession(sessionId);
  const hands = await getAllSessionHandRecords(sessionId);

  const handCount = hands.length;

  // Calculate net profit in BB
  const netProfitBb = handCount > 0
    ? hands.reduce((sum, h) => sum + h.result_bb, 0)
    : 0;

  // Duration in minutes
  const createdAt = new Date(session.created_at).getTime();
  const updatedAt = new Date(session.updated_at).getTime();
  const durationMinutes = Math.max(1, Math.round((updatedAt - createdAt) / 60000));

  // Win rate: percentage of hands won
  const winsCount = hands.filter((h) => h.result_bb > 0).length;
  const winRate = handCount > 0 ? round2((winsCount / handCount) * 100) : 0;

  // Biggest pot hand
  const biggestPotHand = hands.length > 0
    ? hands.reduce((max, h) => {
        const potSize = Math.abs(h.result_bb);
        return potSize > Math.abs(max.result_bb) ? h : max;
      })
    : null;

  // Collect key deviations (most severe first, max 5)
  const keyDeviations = collectKeyDeviations(hands, 5);

  return {
    session_id: sessionId,
    hand_count: handCount,
    net_profit_bb: round2(netProfitBb),
    duration_minutes: durationMinutes,
    win_rate: winRate,
    biggest_pot_hand_id: biggestPotHand?.id,
    key_deviations: keyDeviations,
  };
}

// ============================================================
// Internal helpers
// ============================================================

/**
 * Validate session status transitions.
 */
function validateTransition(
  currentStatus: SessionStatus,
  action: UpdateSessionRequest['action'],
): void {
  const validTransitions: Record<SessionStatus, UpdateSessionRequest['action'][]> = {
    active: ['pause', 'end'],
    paused: ['resume', 'end'],
    completed: [],
  };

  const allowed = validTransitions[currentStatus];
  if (!allowed.includes(action)) {
    throw new InvalidTransitionError(currentStatus, action);
  }
}

/**
 * Extract the most impactful deviations across all hands in a session.
 */
function collectKeyDeviations(
  hands: HandRecord[],
  maxItems: number,
): DeviationSummaryItem[] {
  const deviations: DeviationSummaryItem[] = [];

  for (const hand of hands) {
    if (!hand.has_deviation) continue;

    // The hand record itself doesn't store full deviation data inline,
    // but we can flag hands that have deviations. For the summary,
    // we create a summary item from the hand-level info.
    if (hand.max_deviation_severity) {
      deviations.push({
        hand_id: hand.id,
        hand_number: hand.hand_number,
        street: hand.street_reached as DeviationSummaryItem['street'],
        severity: hand.max_deviation_severity as DeviationSummaryItem['severity'],
        description: `Hand #${hand.hand_number}: ${hand.max_deviation_severity} deviation on ${hand.street_reached}`,
        ev_loss: 0, // Will be populated by deviation analyzer when available
      });
    }
  }

  // Sort by severity: severe > moderate > minor
  const severityOrder: Record<string, number> = { severe: 3, moderate: 2, minor: 1 };
  deviations.sort(
    (a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0),
  );

  return deviations.slice(0, maxItems);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================================
// Error classes
// ============================================================

export class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: SessionStatus, action: string) {
    super(`Cannot ${action} a session in '${from}' status`);
    this.name = 'InvalidTransitionError';
  }
}
