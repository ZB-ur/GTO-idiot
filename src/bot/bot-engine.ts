import type { PlayerAction, GameState, GTORecommendation, BotStyle, ActionType, HandPlayerState, AvailableActions } from '../types';
import { getStyleProfile } from './style-profiles';

/**
 * BotEngine decides actions for BOT players by adjusting GTO-recommended
 * action frequencies according to each bot's style profile.
 */
export class BotEngine {
  /**
   * Decide a bot's action based on its style profile and GTO recommendation.
   * The bot uses GTO frequencies as a baseline and adjusts them according to
   * its style profile's aggression factor and tendencies.
   */
  decide(
    botId: string,
    botStyle: BotStyle,
    gameState: GameState,
    gtoRecommendation: GTORecommendation
  ): PlayerAction {
    const profile = getStyleProfile(botStyle);
    const hand = gameState.currentHand;
    if (!hand) return { action: 'fold' };

    const botPlayer = hand.players.find((p) => p.playerId === botId);
    if (!botPlayer) return { action: 'fold' };

    // Compute available actions for the bot
    const available = this.getAvailableActionsForBot(botPlayer, hand);
    const gtoActions = gtoRecommendation.actions;

    // If we have GTO data, adjust frequencies by style
    if (gtoActions.length > 0) {
      const adjusted = this.adjustFrequencies(gtoActions, profile, hand, available);
      const chosen = this.selectByFrequency(adjusted);
      return this.toPlayerAction(chosen, available, hand);
    }

    // Fallback: simple heuristic based on style when no GTO data
    return this.fallbackDecision(profile, available, hand, botPlayer);
  }

  /**
   * Adjust GTO action frequencies based on bot style profile.
   */
  private adjustFrequencies(
    gtoActions: { action: string; frequency: number; sizing?: string }[],
    profile: ReturnType<typeof getStyleProfile>,
    hand: NonNullable<GameState['currentHand']>,
    available: AvailableActions
  ): { action: string; frequency: number; sizing?: string }[] {
    const adjusted = gtoActions.map((a) => ({
      action: a.action,
      frequency: a.frequency,
      sizing: a.sizing,
    }));

    for (const entry of adjusted) {
      const act = entry.action.toLowerCase();

      if (act.includes('raise') || act.includes('bet') || act === 'all_in') {
        // Aggressive actions boosted by aggression factor
        entry.frequency *= profile.aggressionFactor;
      } else if (act === 'fold') {
        // Fold frequency reduced for loose players, increased for tight
        // vpipAdjust > 0 means looser (less folding)
        entry.frequency *= Math.max(0.1, 1 - profile.vpipAdjust);
      } else if (act === 'call') {
        // Call frequency adjusted by VPIP
        entry.frequency *= (1 + profile.vpipAdjust);
      } else if (act === 'check') {
        // Check frequency inversely related to aggression
        entry.frequency *= Math.max(0.2, 1 / profile.aggressionFactor);
      }

      // Apply street-specific adjustments
      if (hand.street === 'preflop') {
        if (act.includes('3bet') || act.includes('raise_3') || act.includes('raise')) {
          entry.frequency *= (1 + profile.threeBetAdjust);
        }
        if (act === 'fold' && hand.players.some((p) => p.bet > 0)) {
          entry.frequency *= (1 + profile.foldTo3BetAdjust);
        }
      } else {
        // Postflop adjustments
        if (act.includes('bet') || act.includes('cbet')) {
          entry.frequency *= (1 + profile.cbetAdjust);
        }
        if (act.includes('check_raise') || act.includes('checkraise')) {
          entry.frequency *= (1 + profile.checkRaiseAdjust);
        }
      }

      // Ensure non-negative
      entry.frequency = Math.max(0, entry.frequency);
    }

    // Normalize frequencies to sum to 1
    const total = adjusted.reduce((sum, a) => sum + a.frequency, 0);
    if (total > 0) {
      for (const a of adjusted) {
        a.frequency /= total;
      }
    }

    // Filter out actions not available
    return adjusted.filter((a) => {
      const act = this.normalizeActionType(a.action);
      return available.actions.includes(act);
    });
  }

  /**
   * Select an action based on weighted random selection from frequency distribution.
   */
  private selectByFrequency(
    actions: { action: string; frequency: number; sizing?: string }[]
  ): { action: string; frequency: number; sizing?: string } {
    if (actions.length === 0) {
      return { action: 'check', frequency: 1 };
    }

    const total = actions.reduce((sum, a) => sum + a.frequency, 0);
    if (total <= 0) return actions[0];

    let roll = Math.random() * total;
    for (const action of actions) {
      roll -= action.frequency;
      if (roll <= 0) return action;
    }
    return actions[actions.length - 1];
  }

  /**
   * Convert a selected GTO action string into a concrete PlayerAction
   * with correct amount for raises.
   */
  private toPlayerAction(
    selected: { action: string; frequency: number; sizing?: string },
    available: AvailableActions,
    hand: NonNullable<GameState['currentHand']>
  ): PlayerAction {
    const actionType = this.normalizeActionType(selected.action);

    if (actionType === 'fold') return { action: 'fold' };
    if (actionType === 'check') return { action: 'check' };
    if (actionType === 'call') return { action: 'call' };
    if (actionType === 'all_in') {
      return { action: 'all_in', amount: available.maxRaise };
    }

    if (actionType === 'raise') {
      const amount = this.calculateRaiseAmount(selected, available, hand);
      return { action: 'raise', amount };
    }

    // Default fallback
    if (available.actions.includes('check')) return { action: 'check' };
    return { action: 'fold' };
  }

  /**
   * Calculate raise amount from sizing string or GTO action label.
   */
  private calculateRaiseAmount(
    selected: { action: string; sizing?: string },
    available: AvailableActions,
    hand: NonNullable<GameState['currentHand']>
  ): number {
    const minRaise = available.minRaise ?? available.toCall * 2;
    const maxRaise = available.maxRaise ?? minRaise * 10;
    const pot = available.potSize;

    // Try to parse sizing from the action or sizing field
    const sizingStr = selected.sizing ?? selected.action;
    let amount = minRaise;

    if (sizingStr.includes('1/3')) {
      amount = Math.round(pot * 0.33);
    } else if (sizingStr.includes('1/2') || sizingStr.includes('half')) {
      amount = Math.round(pot * 0.5);
    } else if (sizingStr.includes('2/3')) {
      amount = Math.round(pot * 0.67);
    } else if (sizingStr.includes('3/4')) {
      amount = Math.round(pot * 0.75);
    } else if (sizingStr.includes('pot') || sizingStr.includes('100')) {
      amount = pot;
    } else if (sizingStr.includes('2x')) {
      amount = available.toCall * 2;
    } else if (sizingStr.includes('3x')) {
      amount = available.toCall * 3;
    } else if (sizingStr.includes('4x')) {
      amount = available.toCall * 4;
    } else {
      // Extract numeric multiplier from action like "raise_66" => 66% pot
      const match = sizingStr.match(/(\d+)/);
      if (match) {
        const pct = parseInt(match[1], 10);
        if (pct > 0 && pct <= 200) {
          amount = Math.round(pot * (pct / 100));
        }
      }
    }

    // Clamp between min and max
    amount = Math.max(minRaise, Math.min(maxRaise, amount));

    // Add some randomness (±10%) for more realistic play
    const variance = 0.9 + Math.random() * 0.2;
    amount = Math.round(amount * variance);
    amount = Math.max(minRaise, Math.min(maxRaise, amount));

    return amount;
  }

  /**
   * Normalize various GTO action strings to ActionType.
   */
  private normalizeActionType(action: string): ActionType {
    const lower = action.toLowerCase();
    if (lower === 'fold') return 'fold';
    if (lower === 'check') return 'check';
    if (lower === 'call') return 'call';
    if (lower === 'all_in' || lower === 'allin' || lower === 'all-in' || lower === 'shove') return 'all_in';
    if (lower.includes('raise') || lower.includes('bet') || lower.includes('3bet') || lower.includes('4bet')) return 'raise';
    return 'check';
  }

  /**
   * Fallback decision when no GTO data is available.
   * Uses style-based heuristics.
   */
  private fallbackDecision(
    profile: ReturnType<typeof getStyleProfile>,
    available: AvailableActions,
    hand: NonNullable<GameState['currentHand']>,
    botPlayer: HandPlayerState
  ): PlayerAction {
    const roll = Math.random();

    // Base frequencies: check/call 40%, raise 30%, fold 30%
    // Adjust by aggression factor
    const aggressiveness = profile.aggressionFactor;
    const vpipBoost = profile.vpipAdjust;

    // Tighter players fold more preflop
    const foldThreshold = Math.max(0.05, 0.3 - vpipBoost);
    const raiseThreshold = foldThreshold + Math.min(0.6, 0.3 * aggressiveness);

    if (available.toCall === 0) {
      // No bet to face — can check or bet
      if (available.actions.includes('raise') && roll > (1 - 0.3 * aggressiveness)) {
        const amount = this.calculateFallbackRaise(available, hand.pot);
        return { action: 'raise', amount };
      }
      return { action: 'check' };
    }

    // Facing a bet
    if (roll < foldThreshold && available.actions.includes('fold')) {
      return { action: 'fold' };
    }

    if (roll < raiseThreshold && available.actions.includes('raise')) {
      const amount = this.calculateFallbackRaise(available, hand.pot);
      return { action: 'raise', amount };
    }

    if (available.actions.includes('call')) {
      return { action: 'call' };
    }

    if (available.actions.includes('check')) {
      return { action: 'check' };
    }

    return { action: 'fold' };
  }

  /**
   * Calculate a fallback raise amount (between min and pot-sized).
   */
  private calculateFallbackRaise(available: AvailableActions, pot: number): number {
    const minRaise = available.minRaise ?? 2;
    const maxRaise = available.maxRaise ?? pot * 2;

    // Random sizing between 50% and 100% pot, clamped
    const target = pot * (0.5 + Math.random() * 0.5);
    return Math.max(minRaise, Math.min(maxRaise, Math.round(target)));
  }

  /**
   * Determine what actions are available to a bot at the current game state.
   */
  private getAvailableActionsForBot(
    botPlayer: HandPlayerState,
    hand: NonNullable<GameState['currentHand']>
  ): AvailableActions {
    const maxBet = Math.max(...hand.players.map((p) => p.bet));
    const toCall = maxBet - botPlayer.bet;
    const pot = hand.pot;
    const canCheck = toCall === 0;
    const canCall = toCall > 0 && botPlayer.chipStack >= toCall;
    const minRaise = Math.max(maxBet * 2, maxBet + (hand.street === 'preflop' ? this.getBigBlind(hand) : maxBet));
    const maxRaise = botPlayer.chipStack;
    const canRaise = botPlayer.chipStack > toCall && botPlayer.chipStack >= minRaise;

    const actions: ActionType[] = [];
    if (canCheck) actions.push('check');
    if (toCall > 0) actions.push('fold');
    if (canCall) actions.push('call');
    if (canRaise) actions.push('raise');
    actions.push('all_in');

    // Ensure at least fold if nothing else is available
    if (actions.length === 0) actions.push('fold');

    return {
      actions,
      potSize: pot,
      toCall,
      minRaise: canRaise ? minRaise : undefined,
      maxRaise: maxRaise,
    };
  }

  /**
   * Extract big blind amount from hand state.
   */
  private getBigBlind(hand: NonNullable<GameState['currentHand']>): number {
    // Infer from the BB player's bet preflop if available
    const bbPlayer = hand.players.find((p) => p.position === 'BB');
    if (bbPlayer && bbPlayer.bet > 0) return bbPlayer.bet;
    return 2; // default fallback
  }
}

export const botEngine = new BotEngine();
