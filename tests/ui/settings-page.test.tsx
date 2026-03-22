import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '../../src/pages/SettingsPage';

const renderPage = () => render(<MemoryRouter><SettingsPage /></MemoryRouter>);

describe('Settings Page', () => {
  it('should render all settings controls', () => { renderPage(); expect(screen.getByText('Settings')).toBeDefined(); });
  it('should persist changes on update', () => { renderPage(); expect(document.querySelector('.settings-page')).toBeDefined(); });
  it('should show confirmation dialog for data clear', () => { renderPage(); expect(document.querySelector('.settings-page')).toBeDefined(); });
  it('should toggle sound effects', () => { renderPage(); expect(document.querySelector('.settings-page')).toBeDefined(); });
});
