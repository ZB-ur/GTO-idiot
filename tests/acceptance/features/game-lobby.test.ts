/**
 * Feature Acceptance Tests: F-009 game-lobby
 * Game lobby: new game creation, session list, resume
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';

vi.mock('../../../src/lobby/hooks/useSessionList', () => ({
  useSessionList: vi.fn(),
}));

vi.mock('../../../src/hand-history/services/session-store', () => ({
  createSession: vi.fn().mockResolvedValue({ sessionId: 'sess_new' }),
  listSessions: vi.fn(),
}));

function renderLobby(sessions: any[] = []) {
  const { useSessionList } = require('../../../src/lobby/hooks/useSessionList');
  useSessionList.mockReturnValue({
    sessions,
    isLoading: false,
    error: null,
  });

  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
}

describe('F-009: game-lobby', () => {
  it('F-009: should display "开始新牌局" button and session list on lobby page', () => {
    renderLobby([
      {
        sessionId: 'sess_001',
        createdAt: '2026-03-27T10:00:00Z',
        updatedAt: '2026-03-27T11:30:00Z',
        handsPlayed: 42,
        netProfitBB: 15.5,
        status: 'active',
      },
    ]);

    expect(screen.getByRole('button', { name: /开始新牌局/ })).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument(); // hands played
    expect(screen.getByText(/15\.5/)).toBeInTheDocument(); // net profit
  });

  it('F-009: should show "继续对战" and "查看复盘" buttons for each session', () => {
    renderLobby([
      {
        sessionId: 'sess_001',
        createdAt: '2026-03-27T10:00:00Z',
        updatedAt: '2026-03-27T11:30:00Z',
        handsPlayed: 42,
        netProfitBB: 15.5,
        status: 'active',
      },
    ]);

    expect(screen.getByRole('button', { name: /继续对战/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查看复盘/ })).toBeInTheDocument();
  });

  it('F-009: should show empty state when no sessions exist', () => {
    renderLobby([]);

    expect(screen.getByText(/还没有对战记录/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /开始第一局|开始新牌局/ })).toBeInTheDocument();
  });

  it('F-009: should create new session when "开始新牌局" is clicked', async () => {
    const user = userEvent.setup();
    renderLobby([]);

    const newGameBtn = screen.getByRole('button', { name: /开始.*牌局|开始第一局/ });
    await user.click(newGameBtn);

    // Should trigger session creation
    const { createSession } = require('../../../src/hand-history/services/session-store');
    expect(createSession).toHaveBeenCalled();
  });
});
