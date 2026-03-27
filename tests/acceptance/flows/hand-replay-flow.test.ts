/**
 * Flow Tests: Hand Replay
 * Multi-step replay navigation with GTO comparison
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/replay/hooks/useHandReplay', () => ({
  useHandReplay: vi.fn(),
}));

const replayData = {
  handId: 'hand_test',
  handNumber: 5,
  playedAt: '2026-03-28T10:05:00Z',
  holeCards: [{ rank: 'A', suit: 's' }, { rank: 'T', suit: 's' }],
  resultBB: 6.0,
  communityCards: {
    flop: [{ rank: 'K', suit: 's' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }],
    turn: { rank: 'Q', suit: 's' },
    river: { rank: '3', suit: 'h' },
  },
  streets: {
    preflop: [
      { playerId: 'user', nickname: '用户', actionType: 'raise', amount: 6, sequenceIndex: 0, potAfter: 9, isUserAction: true },
      { playerId: 'bot_1', nickname: '鲨鱼哥', actionType: 'call', amount: 6, sequenceIndex: 1, potAfter: 15, isUserAction: false },
    ],
    flop: [
      { playerId: 'user', nickname: '用户', actionType: 'bet', amount: 10, sequenceIndex: 2, potAfter: 25, isUserAction: true },
      { playerId: 'bot_1', nickname: '鲨鱼哥', actionType: 'fold', sequenceIndex: 3, potAfter: 25, isUserAction: false },
    ],
  },
  decisions: [
    { decisionIndex: 0, street: 'preflop', sequenceIndex: 0, userAction: { actionType: 'raise', amount: 6 }, gtoAction: { actionType: 'raise', amount: 6 }, rating: 'optimal', evDifferenceBB: 0, isApproximate: false },
    { decisionIndex: 1, street: 'flop', sequenceIndex: 2, userAction: { actionType: 'bet', amount: 10 }, gtoAction: { actionType: 'check' }, rating: 'error', evDifferenceBB: -2.3, isApproximate: true },
  ],
  overallRating: { optimalCount: 1, acceptableCount: 0, errorCount: 1, totalDecisions: 2 },
};

describe('Flow: Hand Replay', () => {
  it('should navigate through streets and view decision details at each point', async () => {
    const user = userEvent.setup();
    const setActiveStreet = vi.fn();
    const selectDecision = vi.fn();

    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: replayData,
      isLoading: false,
      error: null,
      activeStreet: 'preflop',
      setActiveStreet,
      selectedDecision: null,
      selectDecision,
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    // Step 1: Timeline shows preflop as active
    expect(screen.getByText('翻前')).toBeInTheDocument();

    // Step 2: Action sequence shows preflop actions
    expect(screen.getByText(/Raise.*6|加注.*6/i)).toBeInTheDocument();

    // Step 3: Click on flop timeline node
    await user.click(screen.getByText('翻牌'));
    expect(setActiveStreet).toHaveBeenCalledWith('flop');

    // Step 4: Click on a user decision point
    const userDecisionRow = screen.getByText(/用户/).closest('[data-decision]') ||
                            screen.getByText(/用户/);
    await user.click(userDecisionRow);
  });

  it('should show error state when hand history data is unavailable', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: null,
      isLoading: false,
      error: new Error('Hand not found'),
      activeStreet: 'preflop',
      setActiveStreet: vi.fn(),
      selectedDecision: null,
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_missing']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/无法加载|加载失败/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /返回列表/ }) ||
           screen.getByRole('link', { name: /返回列表/ })).toBeInTheDocument();
  });

  it('should show empty message when user folded immediately with no decision points', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: {
        ...replayData,
        decisions: [],
        overallRating: { optimalCount: 0, acceptableCount: 0, errorCount: 0, totalDecisions: 0 },
      },
      isLoading: false,
      error: null,
      activeStreet: 'preflop',
      setActiveStreet: vi.fn(),
      selectedDecision: null,
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/翻前弃牌|没有更多决策点/)).toBeInTheDocument();
  });
});
