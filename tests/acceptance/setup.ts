/**
 * Shared test setup for acceptance tests.
 * Provides common utilities, mocks, and helpers.
 */
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB for tests
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};
vi.stubGlobal('indexedDB', indexedDBMock);

// Mock Web Audio API
vi.stubGlobal('AudioContext', vi.fn(() => ({
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  destination: {},
  decodeAudioData: vi.fn(),
})));

// Mock HTMLAudioElement
vi.stubGlobal('Audio', vi.fn(() => ({
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  volume: 1,
  muted: false,
})));

// Helper: create a standard Card object
export function card(rank: string, suit: string) {
  return { rank, suit };
}

// Helper: create a standard 6-player seat array for testing
export function createTestPlayers() {
  return [
    { playerId: 'user_001', nickname: '用户', seatIndex: 0, isUser: true, chipCount: 400 },
    { playerId: 'bot_001', nickname: '鲨鱼哥', seatIndex: 1, isUser: false, botStyle: 'TAG' as const, chipCount: 400 },
    { playerId: 'bot_002', nickname: '疯狗', seatIndex: 2, isUser: false, botStyle: 'LAG' as const, chipCount: 400 },
    { playerId: 'bot_003', nickname: '石头', seatIndex: 3, isUser: false, botStyle: 'TightPassive' as const, chipCount: 400 },
    { playerId: 'bot_004', nickname: '小鱼', seatIndex: 4, isUser: false, botStyle: 'Fish' as const, chipCount: 400 },
    { playerId: 'bot_005', nickname: '老王', seatIndex: 5, isUser: false, botStyle: 'Balanced' as const, chipCount: 400 },
  ];
}

// Helper: create a minimal game state for testing
export function createTestGameState(overrides: Record<string, unknown> = {}) {
  return {
    handId: 'hand_test_001',
    handNumber: 1,
    street: 'preflop' as const,
    pot: 3,
    communityCards: [],
    seats: createTestPlayers().map((p, i) => ({
      ...p,
      position: (['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const)[i],
      isFolded: false,
      isAllIn: false,
      currentBet: i === 4 ? 1 : i === 5 ? 2 : 0,
      holeCards: p.isUser ? [card('A', 's'), card('K', 'h')] : null,
      lastAction: null,
    })),
    dealerSeatIndex: 3,
    activeSeatIndex: 0,
    isUserTurn: true,
    availableActions: {
      canFold: true,
      canCheck: false,
      canCall: true,
      callAmount: 2,
      canRaise: true,
      minRaise: 4,
      maxRaise: 400,
    },
    isHandComplete: false,
    result: null,
    ...overrides,
  };
}
