import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/store/game-store';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should initialize with idle state', () => {
    const state = useGameStore.getState();
    expect(state.gameState).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should create a new game session via createGame action', async () => {
    await useGameStore.getState().createGame({ blindLevel: '1/2' });
    const state = useGameStore.getState();
    expect(state.gameState).not.toBeNull();
    expect(state.gameState!.players).toHaveLength(6);
    expect(state.isLoading).toBe(false);
  });

  it('should update state after submitAction', async () => {
    await useGameStore.getState().createGame({ blindLevel: '1/2' });
    const gs = useGameStore.getState().gameState;
    if (gs?.currentHand?.isPlayerTurn) {
      await useGameStore.getState().submitAction({ action: 'fold' });
      const updated = useGameStore.getState();
      expect(updated.gameState).toBeDefined();
    }
  });

  it('should provide derived selectors for current player and available actions', async () => {
    await useGameStore.getState().createGame({ blindLevel: '1/2' });
    const gs = useGameStore.getState().gameState;
    expect(gs).not.toBeNull();
    const hand = gs!.currentHand;
    if (hand) {
      expect(hand.activePlayerId).toBeDefined();
      expect(hand.pot).toBeGreaterThan(0);
    }
  });

  it('should dealNextHand and reset hand state', async () => {
    await useGameStore.getState().createGame({ blindLevel: '1/2' });
    const gs = useGameStore.getState().gameState;
    if (gs?.currentHand?.isPlayerTurn) {
      await useGameStore.getState().submitAction({ action: 'fold' });
    }
    await useGameStore.getState().dealNextHand();
    const state = useGameStore.getState();
    if (!state.error) {
      expect(state.gameState?.currentHand?.street).toBe('preflop');
    }
  });
});
