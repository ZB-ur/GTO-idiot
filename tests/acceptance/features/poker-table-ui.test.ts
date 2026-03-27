/**
 * Feature Acceptance Tests: F-001 poker-table-ui
 * 6人桌现金桌的可视化牌桌界面
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';
import { createTestGameState } from '../setup';

// Mock the game session hook to provide controlled game state
vi.mock('../../../src/poker-table/hooks/useGameSession', () => ({
  useGameSession: vi.fn(),
}));

// Mock IndexedDB service layer
vi.mock('../../../src/hand-history/services/session-store', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
}));

function renderTable(gameState = createTestGameState()) {
  const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');
  useGameSession.mockReturnValue({
    gameState,
    submitAction: vi.fn(),
    isLoading: false,
  });

  return render(
    <MemoryRouter initialEntries={['/table/sess_test']}>
      <App />
    </MemoryRouter>
  );
}

describe('F-001: poker-table-ui', () => {
  it('F-001: should display 6 seats with player nicknames, chip counts, and position labels when hand begins', () => {
    renderTable();

    // Verify 6 seats are displayed
    const positions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of positions) {
      expect(screen.getByText(pos)).toBeInTheDocument();
    }

    // Verify user seat
    expect(screen.getByText('用户')).toBeInTheDocument();

    // Verify BOT seats with nicknames
    expect(screen.getByText('鲨鱼哥')).toBeInTheDocument();
    expect(screen.getByText('疯狗')).toBeInTheDocument();
    expect(screen.getByText('石头')).toBeInTheDocument();
    expect(screen.getByText('小鱼')).toBeInTheDocument();
    expect(screen.getByText('老王')).toBeInTheDocument();

    // Verify chip counts displayed (400 chips = 200BB)
    const chipDisplays = screen.getAllByText(/400/);
    expect(chipDisplays.length).toBeGreaterThanOrEqual(6);
  });

  it('F-001: should display community cards progressively as they are dealt (flop 3, turn 1, river 1)', () => {
    // Flop state: 3 community cards
    const flopState = createTestGameState({
      street: 'flop',
      communityCards: [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 'h' },
        { rank: '7', suit: 'd' },
      ],
    });

    renderTable(flopState);

    // Should display 3 community cards with readable suits/ranks
    expect(screen.getByLabelText(/Ace of Spades/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/King of Hearts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seven of Diamonds/i)).toBeInTheDocument();
  });

  it('F-001: should update pot amount in real-time when players bet or raise', () => {
    const stateWithBets = createTestGameState({ pot: 42 });

    renderTable(stateWithBets);

    // Pot display should show the current amount
    expect(screen.getByText(/底池/)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('F-001: should highlight the active player seat when it is their turn to act', () => {
    const state = createTestGameState({ activeSeatIndex: 0, isUserTurn: true });

    renderTable(state);

    // The user's seat (index 0) should have an active/highlight indicator
    const userSeat = screen.getByText('用户').closest('[data-seat]') ||
                     screen.getByText('用户').parentElement;
    // The active seat should have visual distinction (class, aria, etc.)
    // We check that the active player is visually indicated
    expect(userSeat).toBeInTheDocument();
    // Active seat should have an accessible indicator
    expect(screen.getByRole('region', { name: /当前行动/i }) ||
           screen.getByText('用户').closest('[aria-current="true"]'))
      .toBeInTheDocument();
  });

  it('F-001: should display community card slots as empty when no cards are dealt', () => {
    const preflopState = createTestGameState({
      street: 'preflop',
      communityCards: [],
    });

    renderTable(preflopState);

    // Community card area should exist but show empty slots
    expect(screen.getByText(/底池/)).toBeInTheDocument();
    // No face-up community cards should be visible
    expect(screen.queryByLabelText(/Ace of/i)).not.toBeInTheDocument();
  });

  it('F-001: should show turn and river cards added to existing community cards', () => {
    const riverState = createTestGameState({
      street: 'river',
      communityCards: [
        { rank: 'A', suit: 's' },
        { rank: 'K', suit: 'h' },
        { rank: '7', suit: 'd' },
        { rank: '2', suit: 'c' },
        { rank: 'Q', suit: 's' },
      ],
    });

    renderTable(riverState);

    // All 5 community cards should be displayed
    expect(screen.getByLabelText(/Ace of Spades/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Queen of Spades/i)).toBeInTheDocument();
  });
});
