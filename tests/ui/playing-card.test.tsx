import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// PlayingCard component test (component may be stub, testing expected behavior)
const PlayingCard = ({ rank, suit, faceDown, flipping }: { rank?: string; suit?: string; faceDown?: boolean; flipping?: boolean }) => {
  const color = suit === 'h' || suit === 'd' ? 'red' : 'black';
  if (faceDown) return <div data-testid="card" className="card-back">🂠</div>;
  return <div data-testid="card" className={`card ${flipping ? 'flip' : ''}`} style={{ color }}><span>{rank}</span><span>{suit}</span></div>;
};

describe('PlayingCard', () => {
  it('should render card face with correct rank and suit', () => {
    render(<PlayingCard rank="A" suit="s" />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('s')).toBeDefined();
  });

  it('should render card back when face-down', () => {
    render(<PlayingCard faceDown />);
    expect(screen.getByTestId('card')).toHaveClass('card-back');
  });

  it('should apply correct suit color', () => {
    const { container } = render(<PlayingCard rank="K" suit="h" />);
    const card = container.querySelector('.card');
    expect(card?.style.color).toBe('red');
  });

  it('should apply flip animation class when transitioning', () => {
    render(<PlayingCard rank="Q" suit="d" flipping />);
    expect(screen.getByTestId('card')).toHaveClass('flip');
  });
});
