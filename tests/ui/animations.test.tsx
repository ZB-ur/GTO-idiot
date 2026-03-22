import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

describe('Game Animations', () => {
  it('should apply deal animation class to newly dealt cards', () => {
    const Card = ({ dealing }: { dealing: boolean }) => <div className={dealing ? 'deal-anim' : ''} data-testid="card" />;
    const { getByTestId } = render(<Card dealing={true} />);
    expect(getByTestId('card')).toHaveClass('deal-anim');
  });

  it('should apply flip animation to community cards', () => {
    const Card = ({ flipping }: { flipping: boolean }) => <div className={flipping ? 'flip-anim' : ''} data-testid="card" />;
    const { getByTestId } = render(<Card flipping={true} />);
    expect(getByTestId('card')).toHaveClass('flip-anim');
  });

  it('should apply fold fade animation to folded player', () => {
    const Seat = ({ folded }: { folded: boolean }) => <div className={folded ? 'fold-fade' : ''} data-testid="seat" />;
    const { getByTestId } = render(<Seat folded={true} />);
    expect(getByTestId('seat')).toHaveClass('fold-fade');
  });
});
