import { useState } from 'react';
import type { SessionSummary } from '../../../types';

export interface UseSessionListReturn {
  sessions: SessionSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSessionList(): UseSessionListReturn {
  const [sessions] = useState<SessionSummary[]>([]);

  return {
    sessions,
    isLoading: false,
    error: null,
    refresh: async () => {},
  };
}
