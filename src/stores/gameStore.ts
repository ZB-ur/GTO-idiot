import { create } from 'zustand';
import type { HandState, GameSession } from '../types';

interface GameStore {
  handState: HandState | null;
  session: GameSession | null;
  setHandState: (h: HandState | null) => void;
  setSession: (s: GameSession | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  handState: null,
  session: null,
  setHandState: (h) => set({ handState: h }),
  setSession: (s) => set({ session: s }),
}));
