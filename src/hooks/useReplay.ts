import type { HandReplayResponse } from '../types';

export function useReplay(_handId: string | null) {
  return {
    replayData: null as HandReplayResponse | null,
    currentStep: 0,
    nextStep: () => {},
    prevStep: () => {},
    goToStep: (_step: number) => {},
    isLoading: false,
  };
}
