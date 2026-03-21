import { useEffect, useRef, useCallback } from 'react';
import { useReplay } from '../contexts/ReplayContext';

/**
 * Hook that manages replay playback timer and keyboard navigation.
 * Handles auto-advance when playing, and arrow key / space bar controls.
 */
export function useReplayNavigation() {
  const {
    state,
    currentFrame,
    totalFrames,
    nextFrame,
    prevFrame,
    play,
    pause,
    goToFrame,
  } = useReplay();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance when playing
  useEffect(() => {
    if (state.isPlaying && totalFrames > 0) {
      timerRef.current = setInterval(() => {
        nextFrame();
      }, state.playbackSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isPlaying, state.playbackSpeed, nextFrame, totalFrames]);

  // Stop playing when we reach the end
  useEffect(() => {
    if (state.currentFrameIndex >= totalFrames - 1 && state.isPlaying) {
      pause();
    }
  }, [state.currentFrameIndex, totalFrames, state.isPlaying, pause]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextFrame();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevFrame();
          break;
        case ' ':
          e.preventDefault();
          if (state.isPlaying) {
            pause();
          } else {
            if (state.currentFrameIndex >= totalFrames - 1) {
              goToFrame(0);
            }
            play();
          }
          break;
        case 'Home':
          e.preventDefault();
          goToFrame(0);
          break;
        case 'End':
          e.preventDefault();
          goToFrame(totalFrames - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, state.currentFrameIndex, totalFrames, nextFrame, prevFrame, play, pause, goToFrame]);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      if (state.currentFrameIndex >= totalFrames - 1) {
        goToFrame(0);
      }
      play();
    }
  }, [state.isPlaying, state.currentFrameIndex, totalFrames, play, pause, goToFrame]);

  /** Navigate to the next user decision point */
  const goToNextDecision = useCallback(() => {
    if (!state.replayData) return;
    const frames = state.replayData.frames;
    for (let i = state.currentFrameIndex + 1; i < frames.length; i++) {
      if (frames[i]!.isUserDecisionPoint) {
        goToFrame(i);
        return;
      }
    }
  }, [state.replayData, state.currentFrameIndex, goToFrame]);

  /** Navigate to the previous user decision point */
  const goToPrevDecision = useCallback(() => {
    if (!state.replayData) return;
    const frames = state.replayData.frames;
    for (let i = state.currentFrameIndex - 1; i >= 0; i--) {
      if (frames[i]!.isUserDecisionPoint) {
        goToFrame(i);
        return;
      }
    }
  }, [state.replayData, state.currentFrameIndex, goToFrame]);

  return {
    currentFrame,
    totalFrames,
    currentIndex: state.currentFrameIndex,
    isPlaying: state.isPlaying,
    playbackSpeed: state.playbackSpeed,
    togglePlayPause,
    goToNextDecision,
    goToPrevDecision,
  };
}
