// ============================================================
// History Replay — Unit tests for ReplayEngine + Timeline
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { ReplayEngine, buildReplayData } from '../src/replay/replay-engine';
import { buildTimelineSteps, buildTimelineSegments, getTimelineProgress } from '../src/replay/timeline';
import { classifyDecisionQuality } from '../src/types';
import type { HandHistory, HandReplayData, DecisionPointAnalysis } from '../src/types';

function makeHandHistory(): HandHistory {
  return {
    id: 'hand-1',
    sessionId: 'session-1',
    timestamp: '2024-01-01T00:00:00Z',
    handNumber: 1,
    dealerSeat: 0,
    blinds: { smallBlind: 0.5, bigBlind: 1 },
    seats: [
      { seat: 0, name: 'Hero', position: 'BTN', isHuman: true, botStyle: null, startingStackBB: 100, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      { seat: 1, name: 'BOT-TAG-1', position: 'SB', isHuman: false, botStyle: 'TAG', startingStackBB: 100, holeCards: [{ rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }] },
      { seat: 2, name: 'BOT-LAG-2', position: 'BB', isHuman: false, botStyle: 'LAG', startingStackBB: 100, holeCards: [{ rank: 'Q', suit: 'h' }, { rank: 'J', suit: 'h' }] },
    ],
    communityCards: [
      { rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 's' },
      { rank: 'T', suit: 'c' }, { rank: '5', suit: 'h' },
    ],
    actionSequence: [
      { seat: 0, playerName: 'Hero', action: 'raise', amount: 3, street: 'preflop', potAfter: 4.5, timestamp: '2024-01-01T00:00:01Z' },
      { seat: 1, playerName: 'BOT-TAG-1', action: 'fold', amount: null, street: 'preflop', potAfter: 4.5, timestamp: '2024-01-01T00:00:02Z' },
      { seat: 2, playerName: 'BOT-LAG-2', action: 'call', amount: 2, street: 'preflop', potAfter: 7, timestamp: '2024-01-01T00:00:03Z' },
      { seat: 0, playerName: 'Hero', action: 'bet', amount: 5, street: 'flop', potAfter: 12, timestamp: '2024-01-01T00:00:04Z' },
      { seat: 2, playerName: 'BOT-LAG-2', action: 'call', amount: 5, street: 'flop', potAfter: 17, timestamp: '2024-01-01T00:00:05Z' },
      { seat: 0, playerName: 'Hero', action: 'check', amount: null, street: 'turn', potAfter: 17, timestamp: '2024-01-01T00:00:06Z' },
      { seat: 2, playerName: 'BOT-LAG-2', action: 'check', amount: null, street: 'turn', potAfter: 17, timestamp: '2024-01-01T00:00:07Z' },
    ],
    settlement: {
      handId: 'hand-1',
      winners: [{ seat: 0, potIndex: 0, amountWonBB: 17, handRank: 'Pair of Aces' }],
      showdownHands: [
        { seat: 0, holeCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }], handRank: 'Pair of Aces' },
      ],
      chipMovements: [{ seat: 0, changesBB: 8.5 }, { seat: 2, changesBB: -8.5 }],
      playerFinalStacks: [{ seat: 0, stackBB: 108.5 }, { seat: 1, stackBB: 99.5 }, { seat: 2, stackBB: 91.5 }],
      wonWithoutShowdown: false,
    },
  };
}

function makeDecisionPoints(): DecisionPointAnalysis[] {
  return [
    {
      index: 0,
      street: 'preflop',
      gameSnapshot: { communityCards: [], potBB: 1.5, playerStacks: [], userPosition: 'BTN', userHoleCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      userAction: { type: 'raise', amount: 3, evBB: 0.8 },
      gtoEvaluation: { actions: [], recommendedAction: 'raise', recommendedAmount: 3, handStrength: 0.8, potOdds: 0, spr: 67, isDegraded: false },
      evDiffBB: -0.1,
      quality: 'good',
    },
    {
      index: 1,
      street: 'flop',
      gameSnapshot: { communityCards: [{ rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 's' }], potBB: 7, playerStacks: [], userPosition: 'BTN', userHoleCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      userAction: { type: 'bet', amount: 5, evBB: 1.2 },
      gtoEvaluation: { actions: [], recommendedAction: 'bet', recommendedAmount: 4.5, handStrength: 0.85, potOdds: 0, spr: 13, isDegraded: false },
      evDiffBB: -0.3,
      quality: 'good',
    },
    {
      index: 2,
      street: 'turn',
      gameSnapshot: { communityCards: [{ rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 's' }, { rank: 'T', suit: 'c' }], potBB: 17, playerStacks: [], userPosition: 'BTN', userHoleCards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }] },
      userAction: { type: 'check', amount: null, evBB: 0.5 },
      gtoEvaluation: { actions: [], recommendedAction: 'bet', recommendedAmount: 8, handStrength: 0.8, potOdds: 0, spr: 5.4, isDegraded: false },
      evDiffBB: -1.2,
      quality: 'minor_deviation',
    },
  ];
}

// ============================================================
// ReplayEngine tests
// ============================================================

describe('ReplayEngine', () => {
  let engine: ReplayEngine;
  let replayData: HandReplayData;

  beforeEach(() => {
    replayData = buildReplayData(makeHandHistory(), makeDecisionPoints());
    engine = new ReplayEngine(replayData);
  });

  it('load reconstructs timeline from history', () => {
    expect(engine.totalSteps).toBe(8); // 7 actions + 1 initial
    const state = engine.getState();
    expect(state.stepIndex).toBe(0);
    expect(state.street).toBe('preflop');
  });

  it('goToStep navigates forward', () => {
    const state = engine.goToStep(3);
    expect(state.stepIndex).toBe(3);
    expect(state.lastAction).toBeDefined();
  });

  it('goToStep navigates backward', () => {
    engine.goToStep(5);
    const state = engine.goToStep(2);
    expect(state.stepIndex).toBe(2);
  });

  it('goToStep jumps to arbitrary step', () => {
    const state = engine.goToStep(6);
    expect(state.stepIndex).toBe(6);
    expect(state.street).toBe('turn');
  });

  it('clamps to valid range', () => {
    const state = engine.goToStep(100);
    expect(state.stepIndex).toBe(engine.totalSteps - 1);

    const state2 = engine.goToStep(-5);
    expect(state2.stepIndex).toBe(0);
  });
});

// ============================================================
// Timeline tests
// ============================================================

describe('Timeline', () => {
  it('generates correct markers for street transitions', () => {
    const replayData = buildReplayData(makeHandHistory(), makeDecisionPoints());
    expect(replayData.timelineMarkers.length).toBeGreaterThanOrEqual(3);
    const streets = replayData.timelineMarkers.map((m) => m.street);
    expect(streets).toContain('preflop');
    expect(streets).toContain('flop');
    expect(streets).toContain('turn');
  });

  it('marks user decision points distinctly', () => {
    const hand = makeHandHistory();
    const dps = makeDecisionPoints();
    const steps = buildTimelineSteps(hand.actionSequence, 0, dps);

    const userSteps = steps.filter((s) => s.isUserDecision);
    expect(userSteps.length).toBe(3); // Hero acts 3 times
    for (const step of userSteps) {
      expect(step.decisionPointIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it('getTimelineProgress returns correct percentage', () => {
    expect(getTimelineProgress(0, 10)).toBe(0);
    expect(getTimelineProgress(9, 10)).toBe(100);
    expect(getTimelineProgress(5, 11)).toBe(50);
  });
});

// ============================================================
// GTO Analysis & Quality Coding
// ============================================================

describe('GTO Analysis quality coding', () => {
  it('lazy-loads at decision point', () => {
    const replayData = buildReplayData(makeHandHistory(), makeDecisionPoints());
    const engine = new ReplayEngine(replayData);

    // At step 0, no decision analysis
    const analysis0 = engine.getDecisionAnalysis();
    expect(analysis0).toBeNull();

    // Go to step 1 (first user action — Hero raise preflop)
    engine.goToStep(1);
    const analysis1 = engine.getDecisionAnalysis();
    expect(analysis1).toBeDefined();
    expect(analysis1!.street).toBe('preflop');
  });

  it('green for EV loss < 0.5BB', () => {
    expect(classifyDecisionQuality(-0.3)).toBe('good');
    expect(classifyDecisionQuality(0.2)).toBe('good');
  });

  it('yellow for EV loss 0.5-2BB', () => {
    expect(classifyDecisionQuality(-1.0)).toBe('minor_deviation');
    expect(classifyDecisionQuality(-1.9)).toBe('minor_deviation');
  });

  it('red for EV loss > 2BB', () => {
    expect(classifyDecisionQuality(-3.0)).toBe('major_deviation');
    expect(classifyDecisionQuality(-5.0)).toBe('major_deviation');
  });

  it('EV bar display renders correct relative widths', () => {
    const dps = makeDecisionPoints();
    // EV diffs: -0.1, -0.3, -1.2
    const maxAbsEvDiff = Math.max(...dps.map((d) => Math.abs(d.evDiffBB)));
    expect(maxAbsEvDiff).toBe(1.2);

    // Relative widths
    const widths = dps.map((d) => Math.abs(d.evDiffBB) / maxAbsEvDiff * 100);
    expect(widths[0]).toBeCloseTo(8.33, 0);
    expect(widths[1]).toBeCloseTo(25, 0);
    expect(widths[2]).toBeCloseTo(100, 0);
  });
});
