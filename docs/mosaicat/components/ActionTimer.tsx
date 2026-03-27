import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ActionTimerProps {
  durationMs: number;
  onTimeout: () => void;
  active: boolean;
}

export const ActionTimer: React.FC<ActionTimerProps> = ({ durationMs, onTimeout, active }) => {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const ms = now - startTimeRef.current;
    if (ms >= durationMs) {
      setElapsed(durationMs);
      onTimeout();
      return;
    }
    setElapsed(ms);
    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, onTimeout]);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    startTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, tick]);

  const progress = Math.min(elapsed / durationMs, 1);
  const remainingSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  const isUrgent = remainingSec <= 10;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Time</span>
        <span
          className={`text-sm font-bold tabular-nums ${
            isUrgent ? 'text-red-400 animate-pulse' : 'text-gray-100'
          }`}
        >
          {remainingSec}s
        </span>
      </div>
      <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            isUrgent
              ? 'bg-gradient-to-r from-red-500 to-red-400'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
          }`}
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>
    </div>
  );
};