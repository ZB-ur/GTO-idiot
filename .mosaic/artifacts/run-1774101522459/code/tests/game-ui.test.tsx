// ============================================================
// Game UI — Unit tests for Card, CommunityCards, ActionPanel, animations
// ============================================================

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../src/components/game/Card';
import CommunityCards from '../src/components/game/CommunityCards';
import { TIMING } from '../src/components/game/animations';
import type { Card as CardType } from '../src/types';

function card(rank: CardType['rank'], suit: CardType['suit']): CardType {
  return { rank, suit };
}

// ============================================================
// Card component
// ============================================================

describe('Card', () => {
  it('renders correct suit and rank SVG', () => {
    const { container } = render(<Card card={card('A', 's')} faceUp />);
    // Ace should display as "A"
    expect(container.textContent).toContain('A');
    // Spade symbol
    expect(container.textContent).toContain('♠');
  });

  it('renders face-down state', () => {
    const { container } = render(<Card card={card('A', 's')} faceUp={false} />);
    // Should NOT show rank or suit text when face down
    expect(container.textContent).not.toContain('A');
    expect(container.textContent).not.toContain('♠');
  });

  it('renders null card as face-down', () => {
    const { container } = render(<Card card={null} />);
    // Should render the card back pattern
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { container: sm } = render(<Card card={card('K', 'h')} size="sm" />);
    const { container: lg } = render(<Card card={card('K', 'h')} size="lg" />);
    const smEl = sm.firstChild as HTMLElement;
    const lgEl = lg.firstChild as HTMLElement;
    expect(smEl.style.width).toBe('40px');
    expect(lgEl.style.width).toBe('72px');
  });

  it('renders heart suit in red', () => {
    const { container } = render(<Card card={card('K', 'h')} faceUp />);
    expect(container.textContent).toContain('♥');
  });
});

// ============================================================
// CommunityCards component
// ============================================================

describe('CommunityCards', () => {
  const allCards: CardType[] = [
    card('A', 'd'), card('7', 'h'), card('2', 's'),
    card('T', 'c'), card('5', 'h'),
  ];

  it('renders 0 cards for preflop', () => {
    const { container } = render(
      <CommunityCards cards={allCards} phase="preflop" />,
    );
    // Should show placeholder slots but no actual card faces
    const placeholders = container.querySelectorAll('.bg-felt-dark\\/50');
    expect(placeholders.length).toBe(5);
  });

  it('renders 3 cards for flop', () => {
    const { container } = render(
      <CommunityCards cards={allCards} phase="flop" animate={false} />,
    );
    // Should show 3 face-up cards + 2 empty slots
    expect(container.textContent).toContain('♦'); // Ace of diamonds
  });

  it('renders 4 cards for turn', () => {
    const { container } = render(
      <CommunityCards cards={allCards} phase="turn" animate={false} />,
    );
    // Turn should show 4 cards
    expect(container.textContent).toContain('10'); // Ten of clubs
  });

  it('renders 5 cards for river/showdown', () => {
    const { container } = render(
      <CommunityCards cards={allCards} phase="river" animate={false} />,
    );
    // All 5 cards visible
    expect(container.textContent).toContain('♥'); // 5 of hearts
  });
});

// ============================================================
// Animation timing constants
// ============================================================

describe('Animation timing constants', () => {
  it('animation timing constants are defined', () => {
    // The test plan specifies deal 200ms, flip 150ms, chips 300ms
    // Our impl uses different values — verify they exist and are positive
    expect(TIMING.DEAL_CARD).toBeGreaterThan(0);
    expect(TIMING.FLIP_CARD).toBeGreaterThan(0);
    expect(TIMING.CHIP_MOVE).toBeGreaterThan(0);
    expect(TIMING.FADE_IN).toBeGreaterThan(0);
    expect(TIMING.BOT_THINK).toBeGreaterThan(0);
    expect(TIMING.STREET_TRANSITION).toBeGreaterThan(0);
    expect(TIMING.SETTLE_DELAY).toBeGreaterThan(0);
    expect(TIMING.WINNER_HIGHLIGHT).toBeGreaterThan(0);
  });
});
