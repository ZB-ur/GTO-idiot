import { useState } from 'react';
import type { HandReplay } from '../../../types';

export interface UseHandReplayReturn {
  replay: HandReplay | null;
  isLoading: boolean;
  error: string | null;
  selectedDecisionIndex: number | null;
  selectDecision: (index: number) => void;
}

export function useHandReplay(_handId: string): UseHandReplayReturn {
  const [replay] = useState<HandReplay | null>(null);
  const [selectedDecisionIndex, setSelectedDecisionIndex] = useState<number | null>(null);

  return {
    replay,
    isLoading: false,
    error: null,
    selectedDecisionIndex,
    selectDecision: setSelectedDecisionIndex,
  };
}
