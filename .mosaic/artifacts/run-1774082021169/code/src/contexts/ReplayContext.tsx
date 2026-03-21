import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { ReplayData, ReplayFrame } from '../services/replay-service';
import type { HandAnalysis } from '../types/analysis';
import { getReplayData } from '../services/replay-service';
import { getHandAnalysis } from '../services/analysis-service';

// ─── State ──────────────────────────────────────────────────────────

export interface ReplayState {
  readonly handId: string | null;
  readonly replayData: ReplayData | null;
  readonly analysis: HandAnalysis | null;
  readonly currentFrameIndex: number;
  readonly isPlaying: boolean;
  readonly playbackSpeed: number; // ms per frame
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: ReplayState = {
  handId: null,
  replayData: null,
  analysis: null,
  currentFrameIndex: 0,
  isPlaying: false,
  playbackSpeed: 1000,
  isLoading: false,
  error: null,
};

// ─── Actions ────────────────────────────────────────────────────────

type ReplayAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REPLAY_DATA'; payload: { handId: string; data: ReplayData; analysis: HandAnalysis | null } }
  | { type: 'SET_FRAME'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'RESET' };

function replayReducer(state: ReplayState, action: ReplayAction): ReplayState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_REPLAY_DATA':
      return {
        ...state,
        handId: action.payload.handId,
        replayData: action.payload.data,
        analysis: action.payload.analysis,
        currentFrameIndex: 0,
        isPlaying: false,
        isLoading: false,
        error: null,
      };
    case 'SET_FRAME':
      return { ...state, currentFrameIndex: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_SPEED':
      return { ...state, playbackSpeed: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────

interface ReplayContextValue {
  readonly state: ReplayState;
  readonly currentFrame: ReplayFrame | null;
  readonly totalFrames: number;
  readonly loadReplay: (handId: string) => Promise<void>;
  readonly goToFrame: (index: number) => void;
  readonly nextFrame: () => void;
  readonly prevFrame: () => void;
  readonly play: () => void;
  readonly pause: () => void;
  readonly setSpeed: (ms: number) => void;
  readonly reset: () => void;
}

const ReplayContext = createContext<ReplayContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────

interface ReplayProviderProps {
  readonly children: ReactNode;
}

export function ReplayProvider({ children }: ReplayProviderProps) {
  const [state, dispatch] = useReducer(replayReducer, initialState);

  const totalFrames = state.replayData?.totalFrames ?? 0;
  const currentFrame = state.replayData?.frames[state.currentFrameIndex] ?? null;

  const loadReplay = useCallback(async (handId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [data, analysis] = await Promise.all([
        getReplayData(handId),
        getHandAnalysis(handId),
      ]);
      if (!data) {
        dispatch({ type: 'SET_ERROR', payload: 'Hand not found' });
        return;
      }
      dispatch({
        type: 'SET_REPLAY_DATA',
        payload: { handId, data, analysis: analysis ?? null },
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load replay',
      });
    }
  }, []);

  const goToFrame = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, totalFrames - 1));
    dispatch({ type: 'SET_FRAME', payload: clamped });
  }, [totalFrames]);

  const nextFrame = useCallback(() => {
    if (state.currentFrameIndex < totalFrames - 1) {
      dispatch({ type: 'SET_FRAME', payload: state.currentFrameIndex + 1 });
    } else {
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, [state.currentFrameIndex, totalFrames]);

  const prevFrame = useCallback(() => {
    if (state.currentFrameIndex > 0) {
      dispatch({ type: 'SET_FRAME', payload: state.currentFrameIndex - 1 });
    }
  }, [state.currentFrameIndex]);

  const play = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: true });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  }, []);

  const setSpeed = useCallback((ms: number) => {
    dispatch({ type: 'SET_SPEED', payload: ms });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: ReplayContextValue = {
    state,
    currentFrame,
    totalFrames,
    loadReplay,
    goToFrame,
    nextFrame,
    prevFrame,
    play,
    pause,
    setSpeed,
    reset,
  };

  return <ReplayContext.Provider value={value}>{children}</ReplayContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useReplay(): ReplayContextValue {
  const ctx = useContext(ReplayContext);
  if (!ctx) {
    throw new Error('useReplay must be used within a ReplayProvider');
  }
  return ctx;
}
