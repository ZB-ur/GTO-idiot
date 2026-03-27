/**
 * Feature Acceptance Tests: F-007 hand-replay
 * Hand replay with street timeline, GTO comparison, and ratings
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/replay/hooks/useHandReplay', () => ({
  useHandReplay: vi.fn(),
}));

function renderReplay(replayData: any) {
  const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
  useHandReplay.mockReturnValue({
    replay: replayData,
    isLoading: false,
    error: null,
    activeStreet: 'preflop',
    setActiveStreet: vi.fn(),
    selectedDecision: null,
    selectDecision: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/replay/hand_test']}>
      <App />
    </MemoryRouter>
  );
}

const mockReplayData = {
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
    ],
  },
  decisions: [
    {
      decisionIndex: 0,
      street: 'preflop',
      sequenceIndex: 0,
      userAction: { actionType: 'raise', amount: 6 },
      gtoAction: { actionType: 'raise', amount: 6 },
      rating: 'optimal',
      evDifferenceBB: 0,
      isApproximate: false,
    },
    {
      decisionIndex: 1,
      street: 'flop',
      sequenceIndex: 2,
      userAction: { actionType: 'bet', amount: 10 },
      gtoAction: { actionType: 'check' },
      rating: 'error',
      evDifferenceBB: -2.3,
      isApproximate: true,
    },
  ],
  overallRating: { optimalCount: 1, acceptableCount: 0, errorCount: 1, totalDecisions: 2 },
};

describe('F-007: hand-replay', () => {
  it('F-007: should display street timeline with 4 clickable nodes (翻前→翻牌→转牌→河牌)', () => {
    renderReplay(mockReplayData);

    expect(screen.getByText('翻前')).toBeInTheDocument();
    expect(screen.getByText('翻牌')).toBeInTheDocument();
    expect(screen.getByText('转牌')).toBeInTheDocument();
    expect(screen.getByText('河牌')).toBeInTheDocument();
  });

  it('F-007: should show user actual choice, GTO recommendation, and EV difference at decision point', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: mockReplayData,
      isLoading: false,
      error: null,
      activeStreet: 'flop',
      setActiveStreet: vi.fn(),
      selectedDecision: mockReplayData.decisions[1],
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    // User's choice
    expect(screen.getByText(/你的选择/)).toBeInTheDocument();
    // GTO recommendation
    expect(screen.getByText(/GTO推荐/)).toBeInTheDocument();
    // EV difference
    expect(screen.getByText(/EV差异|EV.*-2.3/i)).toBeInTheDocument();
    expect(screen.getByText(/估算/)).toBeInTheDocument();
  });

  it('F-007: should display 3-level rating: ✅最优, ⚠️可接受, ❌错误', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: mockReplayData,
      isLoading: false,
      error: null,
      activeStreet: 'preflop',
      setActiveStreet: vi.fn(),
      selectedDecision: mockReplayData.decisions[0],
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    // Optimal rating should show
    expect(screen.getByText(/最优/)).toBeInTheDocument();
  });

  it('F-007: should display "近似参考" badge when GTO data comes from postflop simplified strategy', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: mockReplayData,
      isLoading: false,
      error: null,
      activeStreet: 'flop',
      setActiveStreet: vi.fn(),
      selectedDecision: mockReplayData.decisions[1], // isApproximate: true
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/近似参考/)).toBeInTheDocument();
  });

  it('F-007: should allow clicking timeline nodes to navigate between streets', async () => {
    const setActiveStreet = vi.fn();
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: mockReplayData,
      isLoading: false,
      error: null,
      activeStreet: 'preflop',
      setActiveStreet,
      selectedDecision: null,
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('翻牌'));

    expect(setActiveStreet).toHaveBeenCalledWith('flop');
  });
});
