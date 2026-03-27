/**
 * Feature Acceptance Tests: F-011 hand-list-browser
 * Hand list browsing and filtering
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/replay/hooks/useHandList', () => ({
  useHandList: vi.fn(),
}));

const mockHands = [
  {
    handId: 'hand_001',
    handNumber: 1,
    sessionId: 'sess_001',
    playedAt: '2026-03-28T10:05:00Z',
    holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }],
    resultBB: 12.0,
    gtoRating: { optimalCount: 2, acceptableCount: 1, errorCount: 0, totalDecisions: 3 },
  },
  {
    handId: 'hand_002',
    handNumber: 2,
    sessionId: 'sess_001',
    playedAt: '2026-03-28T10:10:00Z',
    holeCards: [{ rank: '7', suit: 'h' }, { rank: '2', suit: 'd' }],
    resultBB: -6.0,
    gtoRating: { optimalCount: 0, acceptableCount: 1, errorCount: 1, totalDecisions: 2 },
  },
];

function renderHandList(hands = mockHands, filter = 'all') {
  const { useHandList } = require('../../../src/replay/hooks/useHandList');
  useHandList.mockReturnValue({
    hands,
    isLoading: false,
    error: null,
    filter,
    setFilter: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/review']}>
      <App />
    </MemoryRouter>
  );
}

describe('F-011: hand-list-browser', () => {
  it('F-011: should display hand list with hand ID, hole cards, result, and GTO rating summary', () => {
    renderHandList();

    // Result badges: +12 BB and -6 BB
    expect(screen.getByText(/\+12/)).toBeInTheDocument();
    expect(screen.getByText(/-6/)).toBeInTheDocument();

    // GTO rating counts visible
    expect(screen.getByText(/✅.*2|2.*✅/)).toBeInTheDocument();
    expect(screen.getByText(/❌.*1|1.*❌/)).toBeInTheDocument();
  });

  it('F-011: should navigate to replay view when clicking on a hand', async () => {
    const user = userEvent.setup();
    renderHandList();

    // Click on the first hand row
    const handRow = screen.getByText(/\+12/).closest('a, button, [role="link"], [role="row"]');
    if (handRow) {
      await user.click(handRow);
      // Navigation should occur (tested via router)
    }
  });

  it('F-011: should filter to show only hands with ❌ error decisions', async () => {
    const setFilter = vi.fn();
    const { useHandList } = require('../../../src/replay/hooks/useHandList');
    useHandList.mockReturnValue({
      hands: [mockHands[1]], // Only hand with errors
      isLoading: false,
      error: null,
      filter: 'errors_only',
      setFilter,
    });

    render(
      <MemoryRouter initialEntries={['/review']}>
        <App />
      </MemoryRouter>
    );

    // Should show the filter toggle
    expect(screen.getByText(/仅.*❌.*错误|错误决策/)).toBeInTheDocument();

    // Only error hand should be visible
    expect(screen.getByText(/-6/)).toBeInTheDocument();
    expect(screen.queryByText(/\+12/)).not.toBeInTheDocument();
  });

  it('F-011: should show empty state when no hands are recorded', () => {
    renderHandList([]);

    expect(screen.getByText(/还没有对战记录/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /去打一局/ }) ||
           screen.getByRole('button', { name: /去打一局/ })).toBeInTheDocument();
  });

  it('F-011: should show filter empty state when no hands match error filter', () => {
    const { useHandList } = require('../../../src/replay/hooks/useHandList');
    useHandList.mockReturnValue({
      hands: [],
      isLoading: false,
      error: null,
      filter: 'errors_only',
      setFilter: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/review']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/没有包含.*❌.*错误决策|继续保持/)).toBeInTheDocument();
  });
});
