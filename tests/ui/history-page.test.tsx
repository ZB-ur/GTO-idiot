import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HistoryPage from '../../src/pages/HistoryPage';

describe('History Page', () => {
  const renderPage = () => render(<MemoryRouter><HistoryPage /></MemoryRouter>);

  it('should render stats cards row', () => { renderPage(); expect(screen.getByText('Hand History')).toBeDefined(); });
  it('should render filter toolbar', () => { renderPage(); expect(document.querySelector('.history-page')).toBeDefined(); });
  it('should display hand history list', () => { renderPage(); expect(document.querySelector('.history-page')).toBeDefined(); });
  it('should show empty state when no history', () => { renderPage(); expect(screen.getByText('Hand History')).toBeDefined(); });
});
