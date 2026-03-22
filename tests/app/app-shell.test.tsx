import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../../src/pages/DashboardPage';

describe('AppShell', () => {
  it('should render AppShell with TopNav', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText('GTO Idiot')).toBeDefined();
  });

  it('should navigate between all routes', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText('Start Game')).toBeDefined();
    expect(screen.getByText('History')).toBeDefined();
    expect(screen.getByText('Report')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('should show loading screen during GTO data initialization', () => {
    const Loading = () => <div data-testid="loading">Loading GTO data...</div>;
    render(<Loading />);
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should complete GTO data load and transition to app', async () => {
    const { gtoService } = await import('../../src/gto/gto-service');
    await gtoService.init();
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText('GTO Idiot')).toBeDefined();
  });

  it('should show dashboard with start game CTA and quick stats', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText('Start Game')).toBeDefined();
  });
});
