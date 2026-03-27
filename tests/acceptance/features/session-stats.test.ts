/**
 * Feature Acceptance Tests: F-008 session-stats
 * Session statistics: P&L, win rate, GTO compliance
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/statistics/hooks/useStatistics', () => ({
  useStatistics: vi.fn(),
}));

function renderStats(statsData: any) {
  const { useStatistics } = require('../../../src/statistics/hooks/useStatistics');
  useStatistics.mockReturnValue({
    statistics: statsData,
    chartData: statsData?.chartData || [],
    isLoading: false,
    error: null,
  });

  return render(
    <MemoryRouter initialEntries={['/stats']}>
      <App />
    </MemoryRouter>
  );
}

describe('F-008: session-stats', () => {
  it('F-008: should display total P&L in BB, total hands, and win rate', () => {
    renderStats({
      totalHands: 50,
      netProfitBB: 23.5,
      winRate: 0.32,
      gtoMetrics: {
        complianceRate: 0.65,
        avgEvLossPerHand: 1.2,
        totalDecisions: 120,
        evaluatedHands: 50,
        isEstimated: true,
      },
    });

    // Total hands
    expect(screen.getByText(/50/)).toBeInTheDocument();
    // Net profit in BB
    expect(screen.getByText(/23\.5/)).toBeInTheDocument();
    // Win rate
    expect(screen.getByText(/32%|0\.32/)).toBeInTheDocument();
  });

  it('F-008: should display P&L trend chart with hand number on X-axis and cumulative BB on Y-axis', () => {
    renderStats({
      totalHands: 50,
      netProfitBB: 23.5,
      winRate: 0.32,
      chartData: [
        { handIndex: 1, cumulativeBB: 2.0 },
        { handIndex: 10, cumulativeBB: -5.0 },
        { handIndex: 25, cumulativeBB: 10.0 },
        { handIndex: 50, cumulativeBB: 23.5 },
      ],
      gtoMetrics: {
        complianceRate: 0.65,
        avgEvLossPerHand: 1.2,
        totalDecisions: 120,
        evaluatedHands: 50,
        isEstimated: true,
      },
    });

    // Chart should be rendered (checking for chart container or axis labels)
    expect(screen.getByRole('img') || screen.getByLabelText(/盈亏走势/i) || screen.getByText(/BB/)).toBeInTheDocument();
  });

  it('F-008: should display GTO compliance rate and average EV loss per hand', () => {
    renderStats({
      totalHands: 50,
      netProfitBB: 23.5,
      winRate: 0.32,
      gtoMetrics: {
        complianceRate: 0.65,
        avgEvLossPerHand: 1.2,
        totalDecisions: 120,
        evaluatedHands: 50,
        isEstimated: true,
      },
    });

    // GTO compliance rate
    expect(screen.getByText(/65%|GTO符合率/)).toBeInTheDocument();
    // Average EV loss
    expect(screen.getByText(/1\.2/)).toBeInTheDocument();
    // Estimated label
    expect(screen.getByText(/估算/)).toBeInTheDocument();
  });

  it('F-008: should show empty state when no hands have been played', () => {
    renderStats(null);

    expect(screen.getByText(/还没有对战数据/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /开始第一局/ }) ||
           screen.getByRole('button', { name: /开始第一局/ })).toBeInTheDocument();
  });
});
