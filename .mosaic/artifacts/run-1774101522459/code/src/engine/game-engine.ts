// ============================================================
// GameEngine — Top-level orchestrator for poker hands
// ============================================================

import type {
  ActionLogEntry,
  ActionResult,
  AvailableActions,
  BlindStructure,
  Card,
  HandSettlement,
  HandState,
  Player,
  PlayerAction,
} from '../types';
import { DEFAULT_BLINDS } from '../types';
import { getLegalActions } from './betting-round';
import { HandStateMachine, type HandConfig } from './hand-state-machine';
import { settleAtShowdown, settleWithoutShowdown } from './settlement';

export class GameEngine {
  private currentHand: HandStateMachine | null = null;
  private sessionId: string;
  private players: Player[];
  private blinds: BlindStructure;
  private dealerSeat: number;
  private handCount: number;
  private humanSeat: number;

  constructor(params: {
    sessionId: string;
    players: Player[];
    blinds?: BlindStructure;
    dealerSeat: number;
    handCount?: number;
    humanSeat: number;
  }) {
    this.sessionId = params.sessionId;
    this.players = params.players;
    this.blinds = params.blinds ?? DEFAULT_BLINDS;
    this.dealerSeat = params.dealerSeat;
    this.handCount = params.handCount ?? 0;
    this.humanSeat = params.humanSeat;
  }

  /** Start a new hand, rotating the dealer button. */
  startHand(): HandState {
    if (this.currentHand && !this.isHandComplete()) {
      throw new Error('Previous hand not yet completed');
    }

    this.handCount++;
    if (this.handCount > 1) {
      this.rotateDealerButton();
    }

    const config: HandConfig = {
      sessionId: this.sessionId,
      handNumber: this.handCount,
      dealerSeat: this.dealerSeat,
      players: this.players,
      blinds: this.blinds,
      humanSeat: this.humanSeat,
    };

    this.currentHand = new HandStateMachine(config);
    return this.currentHand.startHand();
  }

  /** Get the current hand state. */
  getHandState(): HandState {
    this.requireActiveHand();
    return this.currentHand!.getState();
  }

  /** Get available actions for the current acting player. */
  getAvailableActions(): AvailableActions {
    this.requireActiveHand();
    const hand = this.currentHand!;
    const state = hand.getState();

    if (state.currentActingSeat === null) {
      return {
        handId: state.id,
        seat: -1,
        actions: [],
      };
    }

    const player = state.players.find((p) => p.seat === state.currentActingSeat);
    if (!player) {
      return { handId: state.id, seat: state.currentActingSeat, actions: [] };
    }

    // We need to access the internal betting state — use getLegalActions with
    // the player from the hand state machine
    const internalPlayer = hand.state.players.find((p) => p.seat === state.currentActingSeat)!;
    const actions = getLegalActions(internalPlayer, (hand as any).bettingState);

    return {
      handId: state.id,
      seat: state.currentActingSeat,
      actions,
    };
  }

  /** Submit a player action and get the result. */
  submitAction(action: PlayerAction): ActionResult {
    this.requireActiveHand();
    const hand = this.currentHand!;
    const state = hand.getState();

    if (state.currentActingSeat === null) {
      throw new Error('No player to act — hand may be complete');
    }

    const seat = state.currentActingSeat;
    const { actionLog, isHandComplete } = hand.processAction(seat, action);

    const updatedState = hand.getState();
    let nextActorIsBot = false;

    if (!isHandComplete && updatedState.currentActingSeat !== null) {
      const nextPlayer = this.players.find((p) => p.seat === updatedState.currentActingSeat);
      nextActorIsBot = nextPlayer ? !nextPlayer.isHuman : false;
    }

    return {
      handState: updatedState,
      actionLog,
      isHandComplete,
      nextActorIsBot,
    };
  }

  /** Settle the current hand (showdown or last player standing). */
  settleHand(): HandSettlement {
    this.requireActiveHand();
    const hand = this.currentHand!;
    const state = hand.state;

    if (state.phase !== 'showdown' && state.phase !== 'settled') {
      // Check if only one active player (everyone else folded)
      const activePlayers = state.players.filter((p) => p.isActive);
      if (activePlayers.length > 1) {
        throw new Error(`Cannot settle hand in phase '${state.phase}' with ${activePlayers.length} active players`);
      }
    }

    const activePlayers = state.players.filter((p) => p.isActive);
    const pots = hand.getPotManager().calculatePots();
    const potManager = hand.getPotManager();

    let settlement: HandSettlement;

    if (activePlayers.length === 1) {
      // Won without showdown
      const winnerSeat = activePlayers[0].seat;
      const allStacks = new Map<number, number>();
      const contributions = new Map<number, number>();

      for (const p of state.players) {
        allStacks.set(p.seat, p.stackBB);
        contributions.set(p.seat, potManager.getContribution(p.seat));
      }

      settlement = settleWithoutShowdown({
        handId: hand.handId,
        winnerSeat,
        totalPot: potManager.getTotalPot(),
        allPlayerStacks: allStacks,
        playerContributions: contributions,
      });
    } else {
      // Showdown
      const activeSeatCards = new Map<number, Card[]>();
      for (const p of activePlayers) {
        const cards = hand.getHoleCards(p.seat);
        if (cards) {
          activeSeatCards.set(p.seat, cards);
        }
      }

      const allStacks = new Map<number, number>();
      for (const p of state.players) {
        allStacks.set(p.seat, p.stackBB);
      }

      settlement = settleAtShowdown({
        handId: hand.handId,
        pots,
        communityCards: state.communityCards,
        activeSeatCards,
        allPlayerStacks: allStacks,
      });
    }

    // Apply settlement to player stacks
    for (const fs of settlement.playerFinalStacks) {
      hand.updatePlayerStack(fs.seat, fs.stackBB);
      const sessionPlayer = this.players.find((p) => p.seat === fs.seat);
      if (sessionPlayer) {
        sessionPlayer.stackBB = fs.stackBB;
      }
    }

    hand.markSettled();
    return settlement;
  }

  /** Get the action log for the current hand. */
  getActionLog(): ActionLogEntry[] {
    if (!this.currentHand) return [];
    return this.currentHand.getActionLog();
  }

  /** Check if the current hand is complete. */
  isHandComplete(): boolean {
    if (!this.currentHand) return true;
    const phase = this.currentHand.state.phase;
    return phase === 'showdown' || phase === 'settled';
  }

  /** Get the current hand ID. */
  getCurrentHandId(): string | null {
    return this.currentHand?.handId ?? null;
  }

  /** Get current dealer seat. */
  getDealerSeat(): number {
    return this.dealerSeat;
  }

  /** Get the hand count. */
  getHandCount(): number {
    return this.handCount;
  }

  /** Get all hole cards (after settlement, for history). */
  getAllHoleCards(): Map<number, Card[]> {
    if (!this.currentHand) return new Map();
    return this.currentHand.getAllHoleCards();
  }

  /** Get the full hand state with all cards revealed. */
  getFullHandState(): HandState {
    this.requireActiveHand();
    return this.currentHand!.getFullState();
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private requireActiveHand(): void {
    if (!this.currentHand) {
      throw new Error('No active hand — call startHand() first');
    }
  }

  private rotateDealerButton(): void {
    // Move dealer to next active player
    for (let i = 1; i <= this.players.length; i++) {
      const nextSeat = (this.dealerSeat + i) % this.players.length;
      const player = this.players.find((p) => p.seat === nextSeat);
      if (player && !player.isSittingOut && player.stackBB > 0) {
        this.dealerSeat = nextSeat;
        return;
      }
    }
  }
}
