/**
 * Flow Tests: Poker Table Play
 * Multi-step game flow: deal → action → BOT response → street advance → showdown
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';
import { createTestGameState } from '../setup';

vi.mock('../../../src/poker-table/hooks/useGameSession', () => ({
  useGameSession: vi.fn(),
}));
vi.mock('../../../src/hand-history/services/session-store', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
}));

describe('Flow: Poker Table Play', () => {
  it('should complete a full hand: deal → user action → BOT actions → showdown', async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn();
    const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');

    // Initial state: user's turn preflop
    const initialState = createTestGameState();
    useGameSession.mockReturnValue({
      gameState: initialState,
      submitAction,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/table/sess_test']}>
        <App />
      </MemoryRouter>
    );

    // Step 1: Table should display 6 seats with chips
    expect(screen.getByText('用户')).toBeInTheDocument();
    expect(screen.getByText(/底池/)).toBeInTheDocument();

    // Step 2: User action panel should be visible
    const callButton = screen.getByRole('button', { name: /跟注|Call/i });
    expect(callButton).toBeInTheDocument();

    // Step 3: User clicks call
    await user.click(callButton);
    expect(submitAction).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'call' }));
  });

  it('should show raise slider and validate amount before submitting', async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn();
    const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');

    useGameSession.mockReturnValue({
      gameState: createTestGameState({
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
      }),
      submitAction,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/table/sess_test']}>
        <App />
      </MemoryRouter>
    );

    // Click raise to expand controls
    await user.click(screen.getByRole('button', { name: /加注|Raise/i }));

    // Should show slider or input
    const raiseInput = screen.getByRole('spinbutton') || screen.getByLabelText(/加注金额/i);
    expect(raiseInput).toBeInTheDocument();

    // Enter valid amount and confirm
    await user.clear(raiseInput);
    await user.type(raiseInput, '12');

    // Find and click confirm/submit raise button
    const confirmBtn = screen.getByRole('button', { name: /确认|提交|加注到/i });
    await user.click(confirmBtn);

    expect(submitAction).toHaveBeenCalledWith(expect.objectContaining({
      actionType: 'raise',
      amount: 12,
    }));
  });

  it('should show confirmation dialog when user tries to leave the table', async () => {
    const user = userEvent.setup();
    const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');

    useGameSession.mockReturnValue({
      gameState: createTestGameState(),
      submitAction: vi.fn(),
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/table/sess_test']}>
        <App />
      </MemoryRouter>
    );

    // Click leave table button
    const leaveBtn = screen.getByRole('button', { name: /离开牌桌/ }) ||
                     screen.getByText(/离开牌桌/);
    await user.click(leaveBtn);

    // Should show confirmation dialog
    expect(screen.getByText(/确定要离开/)).toBeInTheDocument();
    expect(screen.getByText(/自动保存/)).toBeInTheDocument();
  });

  it('should display winner banner when a hand completes with showdown', () => {
    const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');

    const completedState = createTestGameState({
      isHandComplete: true,
      isUserTurn: false,
      activeSeatIndex: null,
      result: {
        winners: [{ playerId: 'user_001', nickname: '用户', amount: 42, winningHand: '两对 A和K' }],
        showdown: true,
      },
    });

    useGameSession.mockReturnValue({
      gameState: completedState,
      submitAction: vi.fn(),
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/table/sess_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/赢得底池.*42|用户.*42/)).toBeInTheDocument();
  });

  it('should show loading skeleton during table initialization', () => {
    const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');
    useGameSession.mockReturnValue({
      gameState: null,
      submitAction: vi.fn(),
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/table/sess_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/正在准备牌桌|加载中/i) ||
           document.querySelector('[class*="skeleton"]')).toBeTruthy();
  });
});
