/**
 * Feature Acceptance Tests: F-010 gto-explanation
 * Chinese-language GTO explanations at each decision point
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/replay/hooks/useHandReplay', () => ({
  useHandReplay: vi.fn(),
}));

describe('F-010: gto-explanation', () => {
  it('F-010: should show Chinese explanation when GTO recommendation differs from user choice', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: {
        handId: 'hand_test',
        handNumber: 1,
        holeCards: [{ rank: 'A', suit: 's' }, { rank: 'T', suit: 's' }],
        resultBB: -6,
        decisions: [{
          decisionIndex: 0,
          street: 'preflop',
          userAction: { actionType: 'fold' },
          gtoAction: { actionType: 'raise', amount: 6 },
          rating: 'error',
          evDifferenceBB: -3.5,
          isApproximate: false,
        }],
      },
      isLoading: false,
      activeStreet: 'preflop',
      setActiveStreet: vi.fn(),
      selectedDecision: {
        decisionIndex: 0,
        street: 'preflop',
        position: 'CO',
        holeCards: [{ rank: 'A', suit: 's' }, { rank: 'T', suit: 's' }],
        userAction: { actionType: 'fold', label: '弃牌' },
        gtoAction: { actionType: 'raise', amount: 6, label: '加注到 6' },
        rating: 'error',
        evDifferenceBB: -3.5,
        isApproximate: false,
        confidenceLevel: 'exact',
        explanation: 'CO位置，ATs属于标准开牌范围。弃牌损失了正EV的机会。',
      },
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    // Should display Chinese explanation
    expect(screen.getByText(/CO位置/)).toBeInTheDocument();
    expect(screen.getByText(/ATs/)).toBeInTheDocument();
  });

  it('F-010: should include position and hand strength context in preflop explanations', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: { handId: 'hand_test', handNumber: 1, holeCards: [], resultBB: 0, decisions: [] },
      isLoading: false,
      activeStreet: 'preflop',
      setActiveStreet: vi.fn(),
      selectedDecision: {
        decisionIndex: 0,
        street: 'preflop',
        position: 'UTG',
        holeCards: [{ rank: 'J', suit: 'h' }, { rank: '9', suit: 'd' }],
        userAction: { actionType: 'raise', amount: 6, label: '加注到 6' },
        gtoAction: { actionType: 'fold', label: '弃牌' },
        rating: 'error',
        evDifferenceBB: -1.8,
        isApproximate: false,
        confidenceLevel: 'exact',
        explanation: 'UTG位置开牌范围较紧，J9o不在开牌范围内。',
      },
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/UTG位置/)).toBeInTheDocument();
    expect(screen.getByText(/J9o/)).toBeInTheDocument();
  });

  it('F-010: should include board texture and relative hand strength in postflop explanations', () => {
    const { useHandReplay } = require('../../../src/replay/hooks/useHandReplay');
    useHandReplay.mockReturnValue({
      replay: { handId: 'hand_test', handNumber: 1, holeCards: [], resultBB: 0, decisions: [] },
      isLoading: false,
      activeStreet: 'flop',
      setActiveStreet: vi.fn(),
      selectedDecision: {
        decisionIndex: 1,
        street: 'flop',
        position: 'CO',
        holeCards: [{ rank: 'K', suit: 'h' }, { rank: 'J', suit: 'd' }],
        communityCards: [{ rank: 'K', suit: 's' }, { rank: '9', suit: 'h' }, { rank: '8', suit: 'h' }],
        userAction: { actionType: 'bet', amount: 12, label: '下注 12' },
        gtoAction: { actionType: 'check', label: '过牌' },
        rating: 'acceptable',
        evDifferenceBB: -0.5,
        isApproximate: true,
        confidenceLevel: 'approximate',
        explanation: '湿润牌面上，顶对弱踢脚应该选择过牌而非下注，因为下注会被更好的牌跟注、更差的牌弃牌。',
      },
      selectDecision: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/replay/hand_test']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/湿润牌面/)).toBeInTheDocument();
    expect(screen.getByText(/顶对/)).toBeInTheDocument();
    expect(screen.getByText(/近似参考/)).toBeInTheDocument();
  });
});
