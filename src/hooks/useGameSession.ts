import type { GameSession, CreateGameRequest } from '../types';

export function useGameSession() {
  return {
    session: null as GameSession | null,
    createSession: (_req: CreateGameRequest) => {},
    endSession: () => {},
  };
}
