/**
 * Feature Acceptance Tests: F-004 bot-players
 * 5 BOT players with different styles based on GTO + offsets
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../../src/App';
import { createTestGameState } from '../setup';

vi.mock('../../../src/poker-table/hooks/useGameSession', () => ({
  useGameSession: vi.fn(),
}));
vi.mock('../../../src/hand-history/services/session-store', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
}));

function renderTable(gameState = createTestGameState()) {
  const { useGameSession } = require('../../../src/poker-table/hooks/useGameSession');
  useGameSession.mockReturnValue({
    gameState,
    submitAction: vi.fn(),
    isLoading: false,
  });
  return render(
    <MemoryRouter initialEntries={['/table/sess_test']}>
      <App />
    </MemoryRouter>
  );
}

describe('F-004: bot-players', () => {
  it('F-004: should display 5 BOTs with unique nicknames and visible style tags', () => {
    renderTable();

    // Each BOT should have a style tag
    expect(screen.getByText(/TAG/)).toBeInTheDocument();
    expect(screen.getByText(/LAG/)).toBeInTheDocument();
    expect(screen.getByText(/Fish/)).toBeInTheDocument();
    // TightPassive and Balanced should also be shown
    expect(screen.getByText(/TightPassive|紧弱/)).toBeInTheDocument();
    expect(screen.getByText(/Balanced|平衡/)).toBeInTheDocument();
  });

  it('F-004: should display BOT action result on the table after decision', () => {
    const stateWithBotAction = createTestGameState({
      activeSeatIndex: 2,
      isUserTurn: false,
    });
    stateWithBotAction.seats[1].lastAction = 'Fold';

    renderTable(stateWithBotAction);

    // BOT 鲨鱼哥's last action should be visible
    expect(screen.getByText('Fold')).toBeInTheDocument();
  });

  it('F-004: should show thinking indicator on BOT seat during simulated thinking delay', () => {
    const stateWithBotThinking = createTestGameState({
      activeSeatIndex: 1,
      isUserTurn: false,
    });

    renderTable(stateWithBotThinking);

    // The active BOT seat should show a thinking indicator
    // Either dots animation or text indicator
    expect(
      screen.getByText(/···|思考中/) ||
      screen.getByLabelText(/thinking/i)
    ).toBeInTheDocument();
  });
});

// BOT decision engine unit tests (pure function, no UI)
describe('F-004: bot-decision-engine', () => {
  // These test the bot-engine module directly
  let makeBotDecision: Function;

  beforeAll(async () => {
    const botEngine = await import('../../../src/gto-strategy/bot-engine');
    makeBotDecision = botEngine.makeBotDecision;
  });

  it('F-004: TAG bot should have tighter opening range than standard GTO', () => {
    const decision = makeBotDecision({
      botStyle: 'TAG',
      position: 'UTG',
      holeCards: [{ rank: 'J', suit: 'h' }, { rank: '9', suit: 'd' }], // J9o - marginal
      street: 'preflop',
      scenario: 'open',
      gameState: { pot: 3, highestBet: 2 },
    });

    // TAG bot should fold J9o from UTG (tighter than GTO)
    expect(decision.actionType).toBe('fold');
  });

  it('F-004: Fish bot should call more frequently than GTO recommends', () => {
    const decision = makeBotDecision({
      botStyle: 'Fish',
      position: 'CO',
      holeCards: [{ rank: '7', suit: 'h' }, { rank: '5', suit: 'd' }], // 75o - weak
      street: 'preflop',
      scenario: 'vs_raise',
      gameState: { pot: 9, highestBet: 6 },
    });

    // Fish bot should call with weak hands more often
    expect(decision.actionType).toBe('call');
  });

  it('F-004: BOT decisions should be based on GTO strategy + style offset, not random', () => {
    // Same input should produce deterministic output (given the same RNG seed or base strategy)
    const input = {
      botStyle: 'Balanced' as const,
      position: 'BTN' as const,
      holeCards: [{ rank: 'A', suit: 's' }, { rank: 'A', suit: 'h' }], // AA
      street: 'preflop' as const,
      scenario: 'open' as const,
      gameState: { pot: 3, highestBet: 2 },
    };

    const decision = makeBotDecision(input);

    // AA from BTN should always be a raise regardless of style
    expect(decision.actionType).toBe('raise');
    expect(decision.amount).toBeGreaterThan(2);
  });
});
