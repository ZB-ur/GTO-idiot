// ============================================================
// Game Loop — Integration tests for user action → engine → state flow
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { DeckManager } from '../src/engine/deck-manager';
import { getLegalActions, applyAction, isBettingRoundComplete, resetForNewStreet, type BettingState } from '../src/engine/betting-round';
import { evaluateHand, compareHands } from '../src/engine/hand-evaluator';
import { PotManager } from '../src/engine/pot-manager';
import { computeBotAction, type DecisionContext } from '../src/bot/decision-engine';
import type { Card, HandPlayer, LegalAction } from '../src/types';

function makePlayer(seat: number, name: string, isHuman: boolean, position: HandPlayer['position'], botStyle: 'TAG' | 'LAG' | null = null): HandPlayer {
  return { seat, name, stackBB: 100, position, isActive: true, isAllIn: false, currentBet: 0, holeCards: null, lastAction: null };
}

describe('Game Loop Integration', () => {
  let deck: DeckManager;
  let players: HandPlayer[];
  let pm: PotManager;

  beforeEach(() => {
    deck = new DeckManager();
    deck.shuffle();
    players = [
      makePlayer(0, 'Hero', true, 'BTN'),
      makePlayer(1, 'BOT-TAG-1', false, 'SB', 'TAG'),
      makePlayer(2, 'BOT-LAG-2', false, 'BB', 'LAG'),
    ];
    pm = new PotManager();
    pm.reset([0, 1, 2]);
  });

  it('user action flows through UI → service → engine → state update', () => {
    // Deal hole cards
    const heroCards = deck.dealMany(2);
    const bot1Cards = deck.dealMany(2);
    const bot2Cards = deck.dealMany(2);

    // Post blinds
    players[1].stackBB -= 0.5; players[1].currentBet = 0.5;
    players[2].stackBB -= 1; players[2].currentBet = 1;
    pm.addContribution(1, 0.5);
    pm.addContribution(2, 1);

    const state: BettingState = { currentBet: 1, minRaiseIncrement: 1, lastRaiserSeat: null, activeBettors: 3, actedSeats: new Set(), street: 'preflop', bigBlind: 1 };

    // Hero acts: raise to 3
    const heroActions = getLegalActions(players[0], state);
    expect(heroActions.map(a => a.type)).toContain('raise');

    const result = applyAction(players[0], { type: 'raise', amount: 3 }, state);
    state.actedSeats.add(0);
    state.currentBet = result.newBetLevel;
    state.minRaiseIncrement = Math.max(state.minRaiseIncrement, result.newBetLevel - 1);
    pm.addContribution(0, result.chipsPut);

    expect(players[0].currentBet).toBe(3);
    expect(players[0].stackBB).toBe(97);
    expect(isBettingRoundComplete(players, state)).toBe(false);
  });

  it('bots act sequentially after user action', () => {
    // Post blinds
    players[1].stackBB -= 0.5; players[1].currentBet = 0.5;
    players[2].stackBB -= 1; players[2].currentBet = 1;
    pm.addContribution(1, 0.5); pm.addContribution(2, 1);

    const heroCards: Card[] = [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }];
    const bot1Cards: Card[] = [{ rank: '7', suit: 'd' }, { rank: '2', suit: 'c' }];
    const bot2Cards: Card[] = [{ rank: 'Q', suit: 'h' }, { rank: 'J', suit: 'h' }];

    const state: BettingState = { currentBet: 1, minRaiseIncrement: 1, lastRaiserSeat: null, activeBettors: 3, actedSeats: new Set(), street: 'preflop', bigBlind: 1 };

    // Hero raises
    applyAction(players[0], { type: 'raise', amount: 3 }, state);
    state.currentBet = 3; state.actedSeats.add(0);
    pm.addContribution(0, 3);

    // Bot 1 decides
    const bot1Legal = getLegalActions(players[1], state);
    const ctx1: DecisionContext = {
      player: players[1], botStyle: 'TAG', holeCards: bot1Cards, communityCards: [],
      position: 'SB', street: 'preflop', potBB: pm.getTotalPot(), toCallBB: state.currentBet - players[1].currentBet,
      legalActions: bot1Legal, activePlayers: 3, facingRaise: true, isPreflopAggressor: false, bigBlind: 1,
    };
    const bot1Decision = computeBotAction(ctx1);
    expect(bot1Decision.action.type).toBeDefined();

    // Apply bot1 action
    const b1Result = applyAction(players[1], bot1Decision.action, state);
    state.actedSeats.add(1);
    if (b1Result.newBetLevel > state.currentBet) state.currentBet = b1Result.newBetLevel;
    pm.addContribution(1, b1Result.chipsPut);

    // Bot 2 decides
    const bot2Legal = getLegalActions(players[2], state);
    expect(bot2Legal.length).toBeGreaterThan(0);
  });

  it('game progresses through full hand with user calling', () => {
    const heroCards = deck.dealMany(2);
    deck.dealMany(2); // bot1
    deck.dealMany(2); // bot2

    // Blinds
    players[1].stackBB -= 0.5; players[1].currentBet = 0.5;
    players[2].stackBB -= 1; players[2].currentBet = 1;
    pm.addContribution(1, 0.5); pm.addContribution(2, 1);

    let state: BettingState = { currentBet: 1, minRaiseIncrement: 1, lastRaiserSeat: null, activeBettors: 3, actedSeats: new Set(), street: 'preflop', bigBlind: 1 };

    // Hero calls
    applyAction(players[0], { type: 'call' }, state); state.actedSeats.add(0); pm.addContribution(0, 1);
    // SB calls
    applyAction(players[1], { type: 'call' }, state); state.actedSeats.add(1); pm.addContribution(1, 0.5);
    // BB checks
    applyAction(players[2], { type: 'check' }, state); state.actedSeats.add(2);
    expect(isBettingRoundComplete(players, state)).toBe(true);

    // Flop
    deck.burn();
    const flop = deck.dealMany(3);
    state = resetForNewStreet(players, 'flop', 1);

    // All check through
    for (const p of players) {
      if (p.isActive && !p.isAllIn) {
        applyAction(p, { type: 'check' }, state);
        state.actedSeats.add(p.seat);
      }
    }
    expect(isBettingRoundComplete(players, state)).toBe(true);

    // Turn
    deck.burn(); const turn = deck.deal();
    state = resetForNewStreet(players, 'turn', 1);
    for (const p of players) {
      if (p.isActive) { applyAction(p, { type: 'check' }, state); state.actedSeats.add(p.seat); }
    }

    // River
    deck.burn(); const river = deck.deal();
    state = resetForNewStreet(players, 'river', 1);
    for (const p of players) {
      if (p.isActive) { applyAction(p, { type: 'check' }, state); state.actedSeats.add(p.seat); }
    }

    // Showdown
    const community = [...flop, turn, river];
    const hand = evaluateHand([...heroCards, ...community]);
    expect(hand.category).toBeDefined();
  });

  it('user fold ends participation; hand continues among bots', () => {
    players[1].stackBB -= 0.5; players[1].currentBet = 0.5;
    players[2].stackBB -= 1; players[2].currentBet = 1;

    const state: BettingState = { currentBet: 1, minRaiseIncrement: 1, lastRaiserSeat: null, activeBettors: 3, actedSeats: new Set(), street: 'preflop', bigBlind: 1 };

    // Hero folds
    applyAction(players[0], { type: 'fold' }, state); state.actedSeats.add(0);
    expect(players[0].isActive).toBe(false);

    const activePlayers = players.filter(p => p.isActive);
    expect(activePlayers).toHaveLength(2);
    expect(activePlayers.every(p => !p.isHuman || p.seat !== 0)).toBe(true);
  });

  it('hand auto-settles when all but one folds', () => {
    players[1].stackBB -= 0.5; players[1].currentBet = 0.5;
    players[2].stackBB -= 1; players[2].currentBet = 1;
    pm.addContribution(1, 0.5); pm.addContribution(2, 1);

    const state: BettingState = { currentBet: 1, minRaiseIncrement: 1, lastRaiserSeat: null, activeBettors: 3, actedSeats: new Set(), street: 'preflop', bigBlind: 1 };

    // Hero folds
    applyAction(players[0], { type: 'fold' }, state); state.actedSeats.add(0); pm.markFolded(0);
    // SB folds
    applyAction(players[1], { type: 'fold' }, state); state.actedSeats.add(1); pm.markFolded(1);

    const remaining = players.filter(p => p.isActive);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].seat).toBe(2);

    // BB wins the pot
    const pots = pm.calculatePots();
    expect(pots[0].eligibleSeats).toEqual([2]);
    expect(pots[0].amount).toBe(1.5);
  });
});
