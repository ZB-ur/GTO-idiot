/**
 * Flow Tests: Session Statistics
 * Statistics page with P&L chart, win rate, and GTO metrics
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/statistics/hooks/useStatistics', () => ({
  useStatistics: vi.fn(),
}));

describe('Flow: Session Statistics', () => {
  it('should display complete statistics dashboard with all metrics', () => {
    const { useStatistics } = require('../../../src/statistics/hooks/useStatistics');
    useStatistics.mockReturnValue({
      statistics: {
        totalHands: 150,
        netProfitBB: 23.5,
        winRate: 0.32,
        gtoMetrics: { complianceRate: 0.65, avgEvLossPerHand: 1.2, totalDecisions: 320, evaluatedHands: 120, isEstimated: true },
      },
      chartData: [
        { handIndex: 1, cumulativeBB: 2 },
        { handIndex: 50, cumulativeBB: -10 },
        { handIndex: 100, cumulativeBB: 15 },
        { handIndex: 150, cumulativeBB: 23.5 },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/stats']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/23\.5/)).toBeInTheDocument();
    expect(screen.getByText(/32%|0\.32/)).toBeInTheDocument();
    expect(screen.getByText(/65%|GTO符合率/)).toBeInTheDocument();
  });

  it('should show empty state with CTA when no data exists', () => {
    const { useStatistics } = require('../../../src/statistics/hooks/useStatistics');
    useStatistics.mockReturnValue({ statistics: null, chartData: [], isLoading: false, error: null });

    render(
      <MemoryRouter initialEntries={['/stats']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/还没有对战数据/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /开始第一局/ }) ||
           screen.getByRole('link', { name: /开始第一局/ })).toBeInTheDocument();
  });

  it('should show loading skeleton while computing stats', () => {
    const { useStatistics } = require('../../../src/statistics/hooks/useStatistics');
    useStatistics.mockReturnValue({ statistics: null, chartData: [], isLoading: true, error: null });

    render(
      <MemoryRouter initialEntries={['/stats']}>
        <App />
      </MemoryRouter>
    );

    expect(document.querySelector('[class*="skeleton"]') ||
           document.querySelector('[class*="animate-pulse"]') ||
           screen.queryByLabelText(/加载中/i)).toBeTruthy();
  });
});
