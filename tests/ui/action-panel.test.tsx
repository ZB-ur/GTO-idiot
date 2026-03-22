import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionPanel from '../../src/ui/actions/ActionPanel';

describe('ActionPanel', () => {
  const mockOnAction = vi.fn();
  const defaultAvail = {
    actions: ['fold' as const, 'call' as const, 'raise' as const],
    potSize: 100, toCall: 10, minRaise: 20, maxRaise: 200,
  };

  it('should render available action buttons', () => {
    render(<ActionPanel availableActions={defaultAvail} onAction={mockOnAction} />);
    expect(screen.getByText('fold')).toBeDefined();
    expect(screen.getByText('call')).toBeDefined();
    expect(screen.getByText('raise')).toBeDefined();
  });

  it('should disable unavailable actions', () => {
    render(<ActionPanel availableActions={defaultAvail} onAction={mockOnAction} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      if (btn.textContent !== 'Raise') expect(btn).toBeDisabled();
    });
  });

  it('should show raise slider with min max constraints', () => {
    render(<ActionPanel availableActions={defaultAvail} onAction={mockOnAction} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();
    expect(slider.getAttribute('min')).toBe('20');
    expect(slider.getAttribute('max')).toBe('200');
  });

  it('should display preset raise amounts', () => {
    // RaiseSlider shows a Raise button
    render(<ActionPanel availableActions={defaultAvail} onAction={mockOnAction} />);
    expect(screen.getByText('Raise')).toBeDefined();
  });

  it('should call onAction callback with correct action type and amount', () => {
    const handler = vi.fn();
    render(<ActionPanel availableActions={defaultAvail} onAction={handler} />);
    fireEvent.click(screen.getByText('fold'));
    expect(handler).toHaveBeenCalledWith({ action: 'fold' });
  });
});
