import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReportPage from '../../src/pages/ReportPage';

const renderPage = () => render(<MemoryRouter><ReportPage /></MemoryRouter>);

describe('Report Page', () => {
  it('should render compliance score ring', () => { renderPage(); expect(screen.getByText('GTO Compliance Report')).toBeDefined(); });
  it('should render bar chart for per-street breakdown', () => { renderPage(); expect(document.querySelector('.report-page')).toBeDefined(); });
  it('should render radar chart for per-decision-type breakdown', () => { renderPage(); expect(document.querySelector('.report-page')).toBeDefined(); });
  it('should render weakness ranking list', () => { renderPage(); expect(document.querySelector('.report-page')).toBeDefined(); });
  it('should render range selector for hand count', () => { renderPage(); expect(document.querySelector('.report-page')).toBeDefined(); });
});
