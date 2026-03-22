/**
 * SessionControls — top-bar controls for the game session:
 * hand counter, session timer, end session button, GTO panel toggle.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '../../types';

interface SessionControlsProps {
  session: Session;
  handNumber: number;
  onEndSession: () => void;
  onToggleGTOPanel: () => void;
  isGTOPanelOpen: boolean;
  className?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  handNumber,
  onEndSession,
  onToggleGTOPanel,
  isGTOPanelOpen,
  className = '',
}) => {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const [showConfirm, setShowConfirm] = useState(false);

  // Session timer
  useEffect(() => {
    startRef.current = new Date(session.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  const handleEndClick = () => {
    if (showConfirm) {
      onEndSession();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-dismiss confirm after 3s
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2
      bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 ${className}`}>
      {/* Left: Hand info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Hand</span>
          <span className="text-white font-bold text-sm tabular-nums">
            #{handNumber}
          </span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">Blinds</span>
          <span className="text-white text-sm font-medium tabular-nums">
            {session.blinds.smallBlind}/{session.blinds.bigBlind}
          </span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-xs">⏱</span>
          <span className="text-white text-sm tabular-nums">{formatDuration(elapsed)}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* GTO Reference toggle */}
        <button
          onClick={onToggleGTOPanel}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${isGTOPanelOpen
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          📊 GTO
        </button>

        {/* End session */}
        <button
          onClick={handleEndClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${showConfirm
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gray-700 text-gray-300 hover:bg-red-600/80 hover:text-white'}`}
        >
          {showConfirm ? 'Confirm End?' : '🚪 End Session'}
        </button>
      </div>
    </div>
  );
};

export default SessionControls;
