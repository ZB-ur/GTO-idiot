// ============================================================
// GTO Idiot — Bot Manager
// Manages bot instances and delegates decision-making to
// difficulty-specific strategies. Response time target: <200ms.
// ============================================================

import type {
  Card,
  BotDifficulty,
  PlayerActionRequest,
  HandState,
  PlayerState,
  ActionRecord,
} from '../types';
import type { GameEngine } from '../engine/game-engine';
import { FishStrategy } from './strategies/fish';
import { RegularStrategy } from './strategies/regular';
import { GTOBotStrategy } from './strategies/gto-bot';

// ============================================================
// Strategy interface
// ============================================================

export interface BotDecisionContext {
  /** Current game state */
  handState: HandState;
  /** The bot's seat number */
  seat: number;
  /** The bot's hole cards */
  holeCards: Card[];
  /** Action history for GTO engine */
  actionHistory: ActionRecord[];
  /** Whether this bot was the last aggressor */
  isLastAggressor: boolean;
}

export interface BotStrategy {
  readonly difficulty: BotDifficulty;
  /** Given the game context, return a decision */
  decide(context: BotDecisionContext): PlayerActionRequest;
}

// ============================================================
// Bot instance
// ============================================================

interface BotInstance {
  seat: number;
  name: string;
  difficulty: BotDifficulty;
  strategy: BotStrategy;
}

// ============================================================
// Bot Manager
// ============================================================

export class BotManager {
  private bots: Map<number, BotInstance> = new Map();
  private actionLog: ActionRecord[] = [];

  /**
   * Register a bot at the given seat with the specified difficulty.
   */
  registerBot(seat: number, name: string, difficulty: BotDifficulty): void {
    const strategy = BotManager.createStrategy(difficulty);
    this.bots.set(seat, { seat, name, difficulty, strategy });
  }

  /**
   * Remove all registered bots (called between hands or sessions).
   */
  clearBots(): void {
    this.bots.clear();
  }

  /**
   * Reset the action log for a new hand.
   */
  resetActionLog(): void {
    this.actionLog = [];
  }

  /**
   * Record an action (from any player) for the action history.
   */
  recordAction(record: ActionRecord): void {
    this.actionLog.push(record);
  }

  /**
   * Check if the given seat is a registered bot.
   */
  isBot(seat: number): boolean {
    return this.bots.has(seat);
  }

  /**
   * Get the bot instance at the given seat.
   */
  getBot(seat: number): BotInstance | undefined {
    return this.bots.get(seat);
  }

  /**
   * Get all registered bot seats.
   */
  getBotSeats(): number[] {
    return [...this.bots.keys()];
  }

  /**
   * Get a bot's decision for the current game state.
   * The engine provides the bot's hidden hole cards.
   *
   * @param seat - The bot's seat number
   * @param engine - The game engine (to read hole cards and state)
   * @returns The action the bot wants to take
   */
  getBotAction(seat: number, engine: GameEngine): PlayerActionRequest {
    const bot = this.bots.get(seat);
    if (!bot) {
      throw new Error(`No bot registered at seat ${seat}`);
    }

    const holeCards = engine.getHoleCards(seat);
    if (!holeCards || holeCards.length < 2) {
      // No cards — should not happen, but fold as safety
      return { action: 'fold' };
    }

    const handState = engine.getVisibleState();
    const _player = handState.players.find((p) => p.seat === seat);
    if (!_player) {
      return { action: 'fold' };
    }

    const context: BotDecisionContext = {
      handState,
      seat,
      holeCards,
      actionHistory: [...this.actionLog],
      isLastAggressor: engine.lastAggressor === seat,
    };

    const action = bot.strategy.decide(context);

    // Validate the action — ensure it's legal
    return this.sanitizeAction(action, _player, handState);
  }

  /**
   * Sanitize a bot's action to ensure it's legal.
   * If the action is invalid, fall back to a safe default.
   */
  private sanitizeAction(
    action: PlayerActionRequest,
    _player: PlayerState,
    state: HandState,
  ): PlayerActionRequest {
    const availableTypes = new Set(state.available_actions.map((a) => a.type));

    // If the action type isn't available, pick a safe fallback
    if (!availableTypes.has(action.action)) {
      // Prioritized fallback order
      if (availableTypes.has('check')) return { action: 'check' };
      if (availableTypes.has('call')) return { action: 'call' };
      if (availableTypes.has('fold')) return { action: 'fold' };
      return { action: 'fold' };
    }

    // For raise, validate amount
    if (action.action === 'raise') {
      const minRaise = state.min_raise;
      const maxRaise = state.max_raise;

      if (minRaise === null || maxRaise === null) {
        // Can't raise — fall back
        if (availableTypes.has('call')) return { action: 'call' };
        if (availableTypes.has('check')) return { action: 'check' };
        return { action: 'fold' };
      }

      let amount = action.amount ?? minRaise;
      amount = Math.max(minRaise, Math.min(amount, maxRaise));

      return { action: 'raise', amount };
    }

    return action;
  }

  /**
   * Create a strategy instance for the given difficulty.
   */
  static createStrategy(difficulty: BotDifficulty): BotStrategy {
    switch (difficulty) {
      case 'fish':
        return new FishStrategy();
      case 'regular':
        return new RegularStrategy();
      case 'gto':
        return new GTOBotStrategy();
      default:
        return new FishStrategy();
    }
  }
}
