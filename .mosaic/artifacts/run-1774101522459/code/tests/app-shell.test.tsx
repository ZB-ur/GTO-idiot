// ============================================================
// App Shell — Unit tests for layout, nav, common components
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../src/components/layout/AppShell';
import { TopNav } from '../src/components/layout/TopNav';
import { EmptyState } from '../src/components/common/EmptyState';
import { Skeleton } from '../src/components/common/Skeleton';
import { ToastProvider, useToast } from '../src/components/common/Toast';
import { NewSessionDialog } from '../src/components/session/NewSessionDialog';
import { SessionStatusBar } from '../src/components/session/SessionStatusBar';
import { SessionSummaryModal } from '../src/components/session/SessionSummaryModal';
import type { Session, SessionEndSummary } from '../src/types';

// ============================================================
// AppShell tests
// ============================================================

describe('AppShell', () => {
  it('renders TopNav and content area', () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    // TopNav should be present
    expect(screen.getByText('GTO Idiot')).toBeInTheDocument();
    // Main content area exists
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});

// ============================================================
// TopNav tests
// ============================================================

describe('TopNav', () => {
  it('renders 4 navigation tabs', () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });
});

// ============================================================
// Router tests
// ============================================================

describe('Router', () => {
  it('navigates to correct page components', () => {
    // TopNav links should have correct hrefs
    render(
      <MemoryRouter initialEntries={['/']}>
        <TopNav />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/game');
    expect(hrefs).toContain('/history');
    expect(hrefs).toContain('/stats');
  });
});

// ============================================================
// EmptyState tests
// ============================================================

describe('EmptyState', () => {
  it('renders message and optional action', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No hands yet"
        description="Play some poker to see history"
        actionLabel="Start Game"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('No hands yet')).toBeInTheDocument();
    expect(screen.getByText('Play some poker to see history')).toBeInTheDocument();
    const button = screen.getByText('Start Game');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders without action button when no onAction', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

// ============================================================
// Skeleton tests
// ============================================================

describe('Skeleton', () => {
  it('renders placeholder with correct dimensions', () => {
    const { container } = render(<Skeleton width="w-48" height="h-8" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('w-48');
    expect(el.className).toContain('h-8');
    expect(el.className).toContain('animate-pulse');
  });

  it('applies variant classes', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full');

    const { container: c2 } = render(<Skeleton variant="rect" />);
    expect((c2.firstChild as HTMLElement).className).toContain('rounded-lg');
  });
});

// ============================================================
// Toast tests
// ============================================================

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays and auto-dismisses', async () => {
    vi.useFakeTimers();

    const TestToast: React.FC = () => {
      const { addToast } = useToast();
      return (
        <button onClick={() => addToast('success', 'Test message', 500)}>
          Show Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestToast />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Advance past the auto-dismiss timeout
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByText('Test message')).toBeNull();
  });
});

// ============================================================
// NewSessionDialog tests
// ============================================================

describe('NewSessionDialog', () => {
  it('submits with valid blind levels', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();

    render(
      <NewSessionDialog
        open={true}
        onClose={onClose}
        onCreate={onCreate}
        hasActiveSession={false}
      />,
    );

    expect(screen.getByText('New Session')).toBeInTheDocument();
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    expect(onCreate).toHaveBeenCalledWith('auto', undefined);
  });

  it('renders nothing when closed', () => {
    render(
      <NewSessionDialog
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        hasActiveSession={false}
      />,
    );
    expect(screen.queryByText('New Session')).toBeNull();
  });
});

// ============================================================
// SessionStatusBar tests
// ============================================================

describe('SessionStatusBar', () => {
  it('displays duration, hands, P/L', () => {
    const session: Session = {
      id: 's1',
      status: 'active',
      players: [
        { seat: 0, name: 'Hero', isHuman: true, botStyle: null, stackBB: 115.5, position: 'BTN', isActive: true, isSittingOut: false },
      ],
      blinds: { smallBlind: 0.5, bigBlind: 1 },
      startedAt: new Date(Date.now() - 300000).toISOString(), // 5 min ago
      pausedAt: null,
      endedAt: null,
      handCount: 12,
      currentHandId: null,
      dealerSeat: 0,
    };

    render(<SessionStatusBar session={session} onPause={vi.fn()} onEnd={vi.fn()} />);

    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(screen.getByText('115.5 BB')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

// ============================================================
// SessionSummaryModal tests
// ============================================================

describe('SessionSummaryModal', () => {
  it('displays end-of-session stats', () => {
    const summary: SessionEndSummary = {
      sessionId: 's1',
      startedAt: '2024-01-01T00:00:00Z',
      endedAt: '2024-01-01T01:00:00Z',
      durationMinutes: 60,
      handCount: 50,
      profitLossBB: 15.5,
      avgEvLossPerHand: 0.3,
    };

    render(<SessionSummaryModal summary={summary} onClose={vi.fn()} />);

    expect(screen.getByText('Session Complete')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('+15.5 BB')).toBeInTheDocument();
    expect(screen.getByText('0.30 BB')).toBeInTheDocument();
  });

  it('renders nothing when no summary', () => {
    const { container } = render(
      <SessionSummaryModal summary={null} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
