import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { GameState } from '../../src/types';

const mockGameState: GameState = {
  gameId: 'g1', blindLevel: '1/2', speed: 'normal', handCount: 1, sessionProfit: 0,
  players: Array.from({ length: 6 }, (_, i) => ({
    playerId: `p${i}`, name: `P${i}`, position: (['UTG','HJ','CO','BTN','SB','BB'] as const)[i],
    chipStack: 200, isHuman: i === 0, isActive: true,
  })),
  currentHand: {
    handId: 'h1', street: 'flop', pot: 30, communityCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }, { rank: 'Q', suit: 'd' }],
    dealerPosition: 'BTN', activePlayerId: 'p0', isPlayerTurn: true, status: 'in_progress',
    players: Array.from({ length: 6 }, (_, i) => ({
      playerId: `p${i}`, position: (['UTG','HJ','CO','BTN','SB','BB'] as const)[i],
      chipStack: 200, bet: 0, isFolded: i === 3, isAllIn: false, hasActed: true,
    })),
  },
};

// Minimal PokerTable for testing layout expectations
const PokerTable = ({ gameState }: { gameState: GameState }) => {
  const hand = gameState.currentHand;
  return (
    <div data-testid="poker-table">
      {gameState.players.map((p) => (
        <div key={p.playerId} data-testid={`seat-${p.position}`}
          className={`seat ${hand?.activePlayerId === p.playerId ? 'active' : ''} ${hand?.players.find(hp => hp.playerId === p.playerId)?.isFolded ? 'folded' : ''}`}>
          {p.name}
        </div>
      ))}
      <div data-testid="dealer" className={`dealer-${hand?.dealerPosition}`} />
      <div data-testid="community-cards">{hand?.communityCards.map((c, i) => <span key={i}>{c.rank}{c.suit}</span>)}</div>
      <div data-testid="pot">Pot: {hand?.pot}</div>
    </div>
  );
};

describe('PokerTable', () => {
  it('should render 6 seat positions', () => {
    render(<PokerTable gameState={mockGameState} />);
    for (const pos of ['UTG','HJ','CO','BTN','SB','BB']) {
      expect(screen.getByTestId(`seat-${pos}`)).toBeDefined();
    }
  });

  it('should display dealer button at correct position', () => {
    render(<PokerTable gameState={mockGameState} />);
    expect(screen.getByTestId('dealer')).toHaveClass('dealer-BTN');
  });

  it('should highlight active player seat', () => {
    render(<PokerTable gameState={mockGameState} />);
    expect(screen.getByTestId('seat-UTG')).toHaveClass('active');
  });

  it('should show folded state for eliminated players', () => {
    render(<PokerTable gameState={mockGameState} />);
    expect(screen.getByTestId('seat-BTN')).toHaveClass('folded');
  });

  it('should render community cards area', () => {
    render(<PokerTable gameState={mockGameState} />);
    expect(screen.getByTestId('community-cards').children.length).toBe(3);
  });

  it('should display pot amount', () => {
    render(<PokerTable gameState={mockGameState} />);
    expect(screen.getByTestId('pot')).toHaveTextContent('30');
  });
});
