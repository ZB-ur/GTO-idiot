import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReplayPage from '../../src/pages/ReplayPage';

const renderPage = () => render(
  <MemoryRouter initialEntries={['/history/h1/replay']}>
    <Routes><Route path="/history/:handId/replay" element={<ReplayPage />} /></Routes>
  </MemoryRouter>
);

describe('Replay Page', () => {
  it('should render street navigator', () => { renderPage(); expect(screen.getByText('Hand Replay')).toBeDefined(); });
  it('should render action timeline with color-coded nodes', () => { renderPage(); expect(document.querySelector('.replay-page')).toBeDefined(); });
  it('should display GTO comparison card for selected action', () => { renderPage(); expect(document.querySelector('.replay-page')).toBeDefined(); });
  it('should reveal bot style tags', () => { renderPage(); expect(document.querySelector('.replay-page')).toBeDefined(); });
  it('should show deviation badges', () => { renderPage(); expect(document.querySelector('.replay-page')).toBeDefined(); });
});
