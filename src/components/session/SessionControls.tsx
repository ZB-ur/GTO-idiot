// ============================================================
// GTO Idiot — Session Controls
// Pause / Resume / End session buttons shown during active play
// ============================================================

import { useSessionStore } from '../../stores/session-store';
import { useUIStore } from '../../stores/ui-store';

export default function SessionControls() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const pauseSession = useSessionStore((s) => s.pauseSession);
  const resumeSession = useSessionStore((s) => s.resumeSession);
  const endSession = useSessionStore((s) => s.endSession);
  const updatingSession = useSessionStore((s) => s.updatingSession);
  const addToast = useUIStore((s) => s.addToast);

  if (!currentSession) return null;

  const isPaused = currentSession.status === 'paused';
  const isActive = currentSession.status === 'active';
  const isCompleted = currentSession.status === 'completed';

  if (isCompleted) return null;

  const handlePause = async () => {
    try {
      await pauseSession();
      addToast({ type: 'info', message: 'Session paused' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to pause session' });
    }
  };

  const handleResume = async () => {
    try {
      await resumeSession();
      addToast({ type: 'success', message: 'Session resumed' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to resume session' });
    }
  };

  const handleEnd = async () => {
    try {
      await endSession();
      addToast({ type: 'info', message: 'Session ended' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to end session' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hand count badge */}
      <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
        Hand #{currentSession.hand_count}
      </span>

      {/* Stack display */}
      <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
        {currentSession.player_stack.toFixed(0)} BB
      </span>

      {/* Pause / Resume */}
      {isActive && (
        <button
          onClick={handlePause}
          disabled={updatingSession}
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-500 disabled:opacity-50"
        >
          Pause
        </button>
      )}
      {isPaused && (
        <button
          onClick={handleResume}
          disabled={updatingSession}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
        >
          Resume
        </button>
      )}

      {/* End session */}
      <button
        onClick={handleEnd}
        disabled={updatingSession}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
      >
        End
      </button>
    </div>
  );
}
