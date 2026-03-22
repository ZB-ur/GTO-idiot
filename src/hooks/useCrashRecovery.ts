/**
 * useCrashRecovery — Detects and recovers interrupted sessions on app startup.
 *
 * Checks IndexedDB for active session state that was persisted before the
 * app closed/crashed. If found, offers the user recovery via a toast or
 * auto-navigates to the game view.
 *
 * This hook should be called once at the app root level (e.g., in App.tsx).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { sessionStore } from '../stores/session-store';
import { gameStore } from '../stores/game-store';
import { uiStore } from '../stores/ui-store';
import { sessionStateRepository } from '../persistence/session-state-repository';
import type { Session, SessionState, HandState } from '../types';

// ─── Types ───────────────────────────────────────────────────────

export interface CrashRecoveryState {
  /** Whether recovery check is in progress. */
  isChecking: boolean;
  /** Whether a recoverable session was found. */
  hasRecoverable: boolean;
  /** The recovered session (if user accepts recovery). */
  recoveredSession: Session | null;
  /** The in-progress hand state from the crash (if any). */
  recoveredHandState: HandState | null;
  /** Accept recovery and resume the session. */
  acceptRecovery: () => Promise<void>;
  /** Decline recovery and discard the stale state. */
  declineRecovery: () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useCrashRecovery(): CrashRecoveryState {
  const [isChecking, setIsChecking] = useState(true);
  const [hasRecoverable, setHasRecoverable] = useState(false);
  const [recoveredSession, setRecoveredSession] = useState<Session | null>(null);
  const [recoveredHandState, setRecoveredHandState] = useState<HandState | null>(null);
  const [activeState, setActiveState] = useState<SessionState | null>(null);
  const checkedRef = useRef(false);

  // ── Check for recoverable session on mount ─────────────────────

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    let cancelled = false;

    async function checkForRecovery(): Promise<void> {
      try {
        // Look for any active session state in IndexedDB
        const state = await sessionStateRepository.findActive();

        if (cancelled) return;

        if (!state) {
          setIsChecking(false);
          return;
        }

        // Found an active session state — try loading the session
        try {
          const session = await sessionStore.loadSession(state.sessionId);
          // Don't auto-navigate — let the user decide via the hook consumer

          if (cancelled) return;

          if (session && session.status === 'active') {
            setActiveState(state);
            setRecoveredSession(session);
            setRecoveredHandState(state.currentHandState ?? null);
            setHasRecoverable(true);
          } else {
            // Session is completed or invalid — clean up stale state
            await sessionStateRepository.delete(state.sessionId);
          }
        } catch {
          // Session not found in DB — clean up stale state
          await sessionStateRepository.delete(state.sessionId).catch(() => {});
        }
      } catch {
        // Recovery check is best-effort — never block app startup
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    checkForRecovery();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Accept recovery ────────────────────────────────────────────

  const acceptRecovery = useCallback(async (): Promise<void> => {
    if (!recoveredSession || !activeState) return;

    try {
      // Session is already loaded in the store from the check phase.
      // If there was an in-progress hand, restore the game engine state.
      if (recoveredHandState) {
        // Re-start the hand in the game engine using the recovered state.
        // We start a fresh hand at the same hand number — the cards will
        // be different, but positions and stacks are restored.
        const session = recoveredSession;
        gameStore.startHand(
          session.id,
          session.handCount + 1,
          activeState.players,
          session.dealerIndex,
          session.humanPlayerIndex,
          session.blinds,
        );
      }

      uiStore.navigateTo('game');
      uiStore.showToast('已恢复上次中断的牌局', 'success');
      setHasRecoverable(false);
    } catch (err) {
      console.error('Failed to resume recovered session:', err);
      uiStore.showToast('恢复牌局失败', 'error');
      // Clean up on failure
      await declineRecovery();
    }
  }, [recoveredSession, recoveredHandState, activeState]);

  // ── Decline recovery ───────────────────────────────────────────

  const declineRecovery = useCallback(async (): Promise<void> => {
    if (activeState) {
      try {
        await sessionStateRepository.delete(activeState.sessionId);
      } catch {
        // Best-effort cleanup
      }
    }

    setHasRecoverable(false);
    setRecoveredSession(null);
    setRecoveredHandState(null);
    setActiveState(null);
  }, [activeState]);

  return {
    isChecking,
    hasRecoverable,
    recoveredSession,
    recoveredHandState,
    acceptRecovery,
    declineRecovery,
  };
}
