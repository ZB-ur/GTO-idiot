// ============================================================
// ReplayPage — Full hand replay view with controls, timeline,
// table visualization, and GTO decision analysis
// ============================================================

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { HandReplayData, DecisionPointAnalysis } from '../../types';
import { ReplayEngine, type ReplayState } from '../../replay/replay-engine';
import { getHandReplay } from '../../services/replay-service';
import HandReplayViewer from './HandReplayViewer';
import ReplayTimeline from './ReplayTimeline';
import DecisionAnalysis from './DecisionAnalysis';
import { Skeleton } from '../common/Skeleton';

interface ReplayPageProps {
  handId: string;
  onBack: () => void;
}

// ============================================================
// Playback speeds (ms per step)
// ============================================================

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 2000 },
  { label: '1x', ms: 1000 },
  { label: '2x', ms: 500 },
  { label: '4x', ms: 250 },
] as const;

// ============================================================
// Main Component
// ============================================================

const ReplayPage: React.FC<ReplayPageProps> = ({ handId, onBack }) => {
  // Data loading
  const [replayData, setReplayData] = useState<HandReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replay engine
  const engineRef = useRef<ReplayEngine | null>(null);
  const [state, setState] = useState<ReplayState | null>(null);
  const [currentDP, setCurrentDP] = useState<DecisionPointAnalysis | null>(null);

  // Playback
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1x
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // Load replay data
  // ============================================================

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHandReplay(handId)
      .then((data) => {
        if (cancelled) return;
        setReplayData(data);
        const engine = new ReplayEngine(data);
        engineRef.current = engine;
        const initialState = engine.goToStart();
        setState(initialState);
        setCurrentDP(engine.getDecisionAnalysis());
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load replay');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [handId]);

  // ============================================================
  // Navigation helpers
  // ============================================================

  const updateState = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setState(engine.getState());
    setCurrentDP(engine.getDecisionAnalysis());
  }, []);

  const goToStep = useCallback((step: number) => {
    engineRef.current?.goToStep(step);
    updateState();
  }, [updateState]);

  const goToDecision = useCallback((dpIndex: number) => {
    engineRef.current?.goToDecisionPoint(dpIndex);
    updateState();
    setPlaying(false);
  }, [updateState]);

  const goNext = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.next();
    updateState();
    // Stop at end
    if (engine.currentStep >= engine.totalSteps - 1) {
      setPlaying(false);
    }
  }, [updateState]);

  const goPrev = useCallback(() => {
    engineRef.current?.previous();
    updateState();
  }, [updateState]);

  const goToStart = useCallback(() => {
    engineRef.current?.goToStart();
    updateState();
    setPlaying(false);
  }, [updateState]);

  const goToEnd = useCallback(() => {
    engineRef.current?.goToEnd();
    updateState();
    setPlaying(false);
  }, [updateState]);

  // ============================================================
  // Auto-play
  // ============================================================

  useEffect(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    if (playing) {
      const speed = SPEED_OPTIONS[speedIndex].ms;
      playIntervalRef.current = setInterval(goNext, speed);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [playing, speedIndex, goNext]);

  const togglePlay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    // If at end, restart
    if (engine.currentStep >= engine.totalSteps - 1) {
      engine.goToStart();
      updateState();
    }
    setPlaying((p) => !p);
  }, [updateState]);

  // ============================================================
  // Keyboard shortcuts
  // ============================================================

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, goNext, goPrev, goToStart, goToEnd]);

  // ============================================================
  // Decision point navigation
  // ============================================================

  const decisionPoints = replayData?.decisionPoints ?? [];

  const { prevDP, nextDP } = useMemo(() => {
    if (!state || decisionPoints.length === 0) {
      return { prevDP: -1, nextDP: -1 };
    }
    let prevDP = -1;
    let nextDP = -1;
    for (let i = 0; i < decisionPoints.length; i++) {
      // We'd need to map decision point index to step — use the engine
      const engine = engineRef.current;
      if (!engine) break;
      // Simple approach: check if dp.index < current user-action count
      if (state.decisionPointIndex >= 0) {
        if (i < state.decisionPointIndex) prevDP = i;
        if (i > state.decisionPointIndex && nextDP < 0) nextDP = i;
      } else {
        // Not at a decision point; find nearest
        if (i > 0) prevDP = Math.max(prevDP, i - 1);
        nextDP = 0;
      }
    }
    return { prevDP, nextDP };
  }, [state, decisionPoints]);

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4 max-w-6xl mx-auto space-y-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-80" variant="rect" />
        <Skeleton height="h-12" variant="rect" />
        <Skeleton height="h-40" variant="rect" />
      </div>
    );
  }

  if (error || !replayData || !state) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <button onClick={onBack} className="text-blue-400 hover:underline mb-4 text-sm">&larr; Back to History</button>
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400">
          {error ?? 'Failed to load replay data'}
        </div>
      </div>
    );
  }

  const handHistory = replayData.handHistory;
  const totalEvLoss = replayData.totalEvLossBB;

  return (
    <div className="h-full flex flex-col p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">
              Replay — Hand #{handHistory.handNumber}
            </h2>
            <span className="text-xs text-gray-400">
              {new Date(handHistory.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            {decisionPoints.length} decision{decisionPoints.length !== 1 ? 's' : ''}
          </div>
          {totalEvLoss !== 0 && (
            <div className={`text-sm font-mono font-semibold ${
              totalEvLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalEvLoss >= 0 ? '+' : ''}{totalEvLoss.toFixed(2)} BB EV
            </div>
          )}
        </div>
      </div>

      {/* Main content: Table + Analysis side-by-side on large screens */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left: Table view */}
        <div className="flex-1 flex flex-col min-h-0">
          <HandReplayViewer state={state} className="flex-1" />
        </div>

        {/* Right: Decision analysis */}
        <div className="lg:w-80 shrink-0 overflow-y-auto">
          <DecisionAnalysis decisionPoint={currentDP} compact={false} />

          {/* Decision point quick nav */}
          {decisionPoints.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">Decision Points</div>
              <div className="flex flex-wrap gap-1">
                {decisionPoints.map((dp, i) => {
                  const isActive = state.decisionPointIndex === i;
                  const qualityColor =
                    dp.quality === 'good' ? 'bg-green-600 hover:bg-green-500' :
                    dp.quality === 'minor_deviation' ? 'bg-yellow-600 hover:bg-yellow-500' :
                    'bg-red-600 hover:bg-red-500';

                  return (
                    <button
                      key={i}
                      onClick={() => goToDecision(i)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? `${qualityColor} text-white ring-2 ring-white/30`
                          : `${qualityColor} text-white/80`
                      }`}
                      title={`${dp.street}: ${dp.userAction.type} (${dp.evDiffBB.toFixed(2)} BB)`}
                    >
                      {dp.street.charAt(0).toUpperCase()} — {dp.userAction.type.replace('_', '-')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Timeline + Controls */}
      <div className="mt-4 space-y-3">
        {/* Timeline */}
        <ReplayTimeline
          replayData={replayData}
          state={state}
          onGoToStep={goToStep}
          onGoToDecision={goToDecision}
        />

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Start */}
          <ControlButton onClick={goToStart} title="Go to start (Home)" disabled={state.stepIndex === 0}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
            </svg>
          </ControlButton>

          {/* Previous */}
          <ControlButton onClick={goPrev} title="Previous step (←)" disabled={state.stepIndex === 0}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
            </svg>
          </ControlButton>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center
                       justify-center transition-colors shadow-lg shadow-blue-500/20"
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
          >
            {playing ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <ControlButton onClick={goNext} title="Next step (→)" disabled={state.stepIndex >= state.totalSteps - 1}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
            </svg>
          </ControlButton>

          {/* End */}
          <ControlButton onClick={goToEnd} title="Go to end (End)" disabled={state.stepIndex >= state.totalSteps - 1}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
              <path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
            </svg>
          </ControlButton>

          {/* Spacer */}
          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            {SPEED_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setSpeedIndex(i)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speedIndex === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Prev/Next decision buttons */}
          <ControlButton
            onClick={() => prevDP >= 0 && goToDecision(prevDP)}
            title="Previous decision"
            disabled={prevDP < 0}
          >
            <span className="text-xs">◄DP</span>
          </ControlButton>
          <ControlButton
            onClick={() => nextDP >= 0 && goToDecision(nextDP)}
            title="Next decision"
            disabled={nextDP < 0}
          >
            <span className="text-xs">DP►</span>
          </ControlButton>
        </div>

        {/* Keyboard hints */}
        <div className="text-center text-[10px] text-gray-600">
          Space: Play/Pause · ← → : Step · Home/End: Jump
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Control button helper
// ============================================================

function ControlButton({
  onClick,
  title,
  disabled = false,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                 ${disabled
                   ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                   : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
      {children}
    </button>
  );
}

export default ReplayPage;
