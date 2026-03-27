/**
 * Feature Acceptance Tests: F-002 player-actions
 * User action controls: fold, check, call, raise with validation
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

function renderTable(gameState = createTestGameState()) {
  const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');
  const submitAction = vi.fn();
  useGameSession.mockReturnValue({
    gameState,
    submitAction,
    isLoading: false,
  });

  render(
    <MemoryRouter initialEntries={['/table/sess_test']}>
      <App />
    </MemoryRouter>
  );

  return { submitAction };
}

describe('F-002: player-actions', () => {
  it('F-002: should show fold, call (with amount), and raise buttons when facing a bet', () => {
    const state = createTestGameState({
      isUserTurn: true,
      availableActions: {
        canFold: true,
        canCheck: false,
        canCall: true,
        callAmount: 6,
        canRaise: true,
        minRaise: 12,
        maxRaise: 400,
      },
    });

    renderTable(state);

    expect(screen.getByRole('button', { name: /弃牌|Fold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /跟注.*6|Call.*6/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /加注|Raise/i })).toBeInTheDocument();
  });

  it('F-002: should show check and bet buttons when no one has opened or all checked', () => {
    const state = createTestGameState({
      isUserTurn: true,
      availableActions: {
        canFold: false,
        canCheck: true,
        canCall: false,
        canRaise: true,
        minRaise: 4,
        maxRaise: 400,
      },
    });

    renderTable(state);

    expect(screen.getByRole('button', { name: /过牌|Check/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下注|Bet|加注|Raise/i })).toBeInTheDocument();
    // Fold should NOT be visible when check is available and no bet to face
    expect(screen.queryByRole('button', { name: /弃牌|Fold/i })).not.toBeInTheDocument();
  });

  it('F-002: should show validation error when raise amount is below minimum raise', async () => {
    const user = userEvent.setup();
    const state = createTestGameState({
      isUserTurn: true,
      availableActions: {
        canFold: true,
        canCheck: false,
        canCall: true,
        callAmount: 6,
        canRaise: true,
        minRaise: 12,
        maxRaise: 400,
      },
    });

    renderTable(state);

    // Click raise button to expand raise controls
    await user.click(screen.getByRole('button', { name: /加注|Raise/i }));

    // Enter an amount below minimum
    const raiseInput = screen.getByRole('spinbutton') || screen.getByLabelText(/加注金额|raise amount/i);
    await user.clear(raiseInput);
    await user.type(raiseInput, '8');

    // Should show validation error
    expect(screen.getByText(/最小加注金额.*12|minimum raise/i)).toBeInTheDocument();
  });

  it('F-002: should show validation error when raise amount exceeds remaining stack', async () => {
    const user = userEvent.setup();
    const state = createTestGameState({
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
    });

    renderTable(state);

    await user.click(screen.getByRole('button', { name: /加注|Raise/i }));

    const raiseInput = screen.getByRole('spinbutton') || screen.getByLabelText(/加注金额|raise amount/i);
    await user.clear(raiseInput);
    await user.type(raiseInput, '500');

    expect(screen.getByText(/超过剩余筹码|exceeds.*stack|不能超过/i)).toBeInTheDocument();
  });

  it('F-002: should disable action buttons when it is not the user turn', () => {
    const state = createTestGameState({
      isUserTurn: false,
      activeSeatIndex: 1,
      availableActions: undefined,
    });

    renderTable(state);

    // Action buttons should not be clickable
    const foldButton = screen.queryByRole('button', { name: /弃牌|Fold/i });
    const callButton = screen.queryByRole('button', { name: /跟注|Call/i });
    const raiseButton = screen.queryByRole('button', { name: /加注|Raise/i });
    const checkButton = screen.queryByRole('button', { name: /过牌|Check/i });

    // Either buttons are hidden or disabled
    if (foldButton) expect(foldButton).toBeDisabled();
    if (callButton) expect(callButton).toBeDisabled();
    if (raiseButton) expect(raiseButton).toBeDisabled();
    if (checkButton) expect(checkButton).toBeDisabled();
  });
});
