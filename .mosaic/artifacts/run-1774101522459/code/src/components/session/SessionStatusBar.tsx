// ============================================================
// SessionStatusBar — Shows current session info during gameplay
// ============================================================

import React from 'react';
import type { Session } from '../../types';

interface SessionStatusBarProps {
  session: Session;
  onPause: () => void;
  onEnd: () => void;
}

export const SessionStatusBar: React.FC<SessionStatusBarProps> = ({
  session,
  onPause,
  onEnd,
}) => {
  const humanPlayer = session.players.find((p) => p.isHuman);
  const stackBB = humanPlayer?.stackBB ?? 0;
  const elapsed = getElapsedTime(session.startedAt);

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-6">
        <StatusPill status={session.status} />
        <span className="text-gray-400">
          Hand <span className="text-white font-medium">#{session.handCount}</span>
        </span>
        <span className="text-gray-400">
          Stack <span className="text-white font-medium">{stackBB.toFixed(1)} BB</span>
        </span>
        <span className="text-gray-400">
          Time <span className="text-white font-medium">{elapsed}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {session.status === 'active' && (
          <button onClick={onPause} className="btn-secondary text-xs px-3 py-1">
            Pause
          </button>
        )}
        <button onClick={onEnd} className="btn-danger text-xs px-3 py-1">
          End Session
        </button>
      </div>
    </div>
  );
};

// --- Helpers ---

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    active: 'bg-green-600',
    paused: 'bg-yellow-600',
    completed: 'bg-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white ${colorMap[status] ?? 'bg-gray-600'}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

function getElapsedTime(startedAt: string): string {
  const diff = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
