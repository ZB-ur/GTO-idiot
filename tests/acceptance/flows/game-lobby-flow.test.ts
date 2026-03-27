/**
 * Flow Tests: Game Lobby
 * Covers the complete lobby interaction flow from UX spec
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/lobby/hooks/useSessionList', () => ({
  useSessionList: vi.fn(),
}));

vi.mock('../../../src/hand-history/services/session-store', () => ({
  createSession: vi.fn().mockResolvedValue({
    sessionId: 'sess_new',
    createdAt: new Date().toISOString(),
    status: 'active',
    handsPlayed: 0,
    netProfitBB: 0,
    players: [],
    blinds: { small: 1, big: 2 },
    buyIn: 400,
  }),
  listSessions: vi.fn(),
  getSession: vi.fn(),
}));

describe('Flow: Game Lobby', () => {
  it('should complete happy path: open app → see lobby → start new game → navigate to table', async () => {
    const user = userEvent.setup();
    const { useSessionList } = require('../../../src/lobby/hooks/useSessionList');
    useSessionList.mockReturnValue({ sessions: [], isLoading: false, error: null });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Step 1: Lobby loads with empty state
    expect(screen.getByText(/还没有对战记录/)).toBeInTheDocument();

    // Step 2: Click "开始第一局"
    const startBtn = screen.getByRole('button', { name: /开始.*局/ });
    await user.click(startBtn);

    // Step 3: Should navigate to table page
    await waitFor(() => {
      const { createSession } = require('../../../src/hand-history/services/session-store');
      expect(createSession).toHaveBeenCalled();
    });
  });

  it('should show session list with resume and review options for existing sessions', async () => {
    const { useSessionList } = require('../../../src/lobby/hooks/useSessionList');
    useSessionList.mockReturnValue({
      sessions: [
        {
          sessionId: 'sess_001',
          createdAt: '2026-03-27T10:00:00Z',
          updatedAt: '2026-03-27T11:30:00Z',
          handsPlayed: 42,
          netProfitBB: 15.5,
          status: 'active',
        },
        {
          sessionId: 'sess_002',
          createdAt: '2026-03-26T10:00:00Z',
          updatedAt: '2026-03-26T12:00:00Z',
          handsPlayed: 80,
          netProfitBB: -22.0,
          status: 'completed',
        },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Each session should show hands played and P&L
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/15\.5/)).toBeInTheDocument();
    expect(screen.getByText(/80/)).toBeInTheDocument();

    // Active session should have "继续对战" button
    expect(screen.getByRole('button', { name: /继续对战/ })).toBeInTheDocument();
    // All sessions should have "查看复盘" button
    expect(screen.getAllByRole('button', { name: /查看复盘/ })).toHaveLength(2);
  });

  it('should show loading skeleton while sessions are being fetched', () => {
    const { useSessionList } = require('../../../src/lobby/hooks/useSessionList');
    useSessionList.mockReturnValue({ sessions: [], isLoading: true, error: null });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Should show skeleton placeholders
    expect(screen.getByLabelText(/加载中|loading/i) ||
           document.querySelector('[class*="skeleton"]') ||
           document.querySelector('[class*="animate-pulse"]')).toBeTruthy();
  });

  it('should show error toast when session data fails to load', () => {
    const { useSessionList } = require('../../../src/lobby/hooks/useSessionList');
    useSessionList.mockReturnValue({
      sessions: [],
      isLoading: false,
      error: new Error('Storage error'),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/加载失败|失败|错误/)).toBeInTheDocument();
  });
});
