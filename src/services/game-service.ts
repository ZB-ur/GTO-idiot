import type {
  CreateGameRequest,
  GameState,
  PlayerAction,
  ActionResult,
  HandState,
  AvailableActions,
  GameSummary,
  PlayerInfo,
  HandPlayerState,
  ActionEvent,
  Position,
  BotStyle,
  Card,
  ActionType,
  BlindLevel,
  Speed,
  HandRecord,
  StreetRecord,
  Street,
} from '../types';
import { Deck, HandEvaluator } from '../engine';
import { botEngine } from '../bot';
import { gtoService } from '../gto';

const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
const BOT_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
const ALL_BOT_STYLES: BotStyle[] = ['TAG', 'LAG', 'Fish', 'Nit', 'Maniac'];

function parseBlinds(level: BlindLevel): { sb: number; bb: number } {
  const parts = level.split('/');
  return { sb: parseInt(parts[0], 10), bb: parseInt(parts[1], 10) };
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface InternalGameState {
  gameState: GameState;
  deck: Deck;
  evaluator: HandEvaluator;
  blinds: { sb: number; bb: number };
  dealerIndex: number;
  startedAt: number;
  botStyles: Map<string, BotStyle>;
  holeCards: Map<string, Card[]>;
  streetHistory: StreetRecord[];
  currentStreetActions: ActionEvent[];
  streetPotStart: number;
  handRecords: HandRecord[];
}

const activeGames = new Map<string, InternalGameState>();

export class GameService {
  async createGame(config: CreateGameRequest): Promise<GameState> {
    const gameId = crypto.randomUUID();
    const blinds = parseBlinds(config.blindLevel);
    const stackSize = (config.startingStackBB ?? 100) * blinds.bb;
    const speed = config.speed ?? 'normal';

    // Assign player to a random seat
    const playerSeat = Math.floor(Math.random() * 6);
    const shuffledStyles = shuffleArray(ALL_BOT_STYLES);

    const players: PlayerInfo[] = [];
    const botStyles = new Map<string, BotStyle>();

    for (let i = 0; i < 6; i++) {
      const isHuman = i === playerSeat;
      const playerId = isHuman ? 'player' : `bot-${i}`;
      const botIndex = isHuman ? -1 : (i < playerSeat ? i : i - 1);
      const name = isHuman ? 'You' : BOT_NAMES[botIndex >= 0 ? botIndex % BOT_NAMES.length : 0];
      const position = POSITIONS[i];

      if (!isHuman) {
        botStyles.set(playerId, shuffledStyles[botIndex >= 0 ? botIndex % shuffledStyles.length : 0]);
      }

      players.push({
        playerId,
        name,
        position,
        chipStack: stackSize,
        isHuman,
        isActive: true,
      });
    }

    const gameState: GameState = {
      gameId,
      blindLevel: config.blindLevel,
      speed,
      players,
      currentHand: null,
      handCount: 0,
      sessionProfit: 0,
    };

    const internal: InternalGameState = {
      gameState,
      deck: new Deck(),
      evaluator: new HandEvaluator(),
      blinds,
      dealerIndex: Math.floor(Math.random() * 6),
      startedAt: Date.now(),
      botStyles,
      holeCards: new Map(),
      streetHistory: [],
      currentStreetActions: [],
      streetPotStart: 0,
      handRecords: [],
    };

    activeGames.set(gameId, internal);

    // Deal the first hand
    this.dealHand(internal);

    // Process bot actions until player's turn
    await this.processBotActions(internal);

    return internal.gameState;
  }

  async submitAction(gameId: string, action: PlayerAction): Promise<ActionResult> {
    const internal = activeGames.get(gameId);
    if (!internal) throw new Error('Game not found');

    const hand = internal.gameState.currentHand;
    if (!hand || hand.status !== 'in_progress') {
      throw new Error('No active hand');
    }

    const processedActions: ActionEvent[] = [];
    const playerInfo = internal.gameState.players.find((p) => p.isHuman);
    if (!playerInfo) throw new Error('Player not found');

    // Apply player action
    const playerEvent = this.applyAction(internal, playerInfo.playerId, action);
    processedActions.push(playerEvent);

    // Check if street or hand is over after player action
    this.checkStreetEnd(internal);

    // Process bot actions until player's next decision or hand ends
    const botActions = await this.processBotActions(internal);
    processedActions.push(...botActions);

    return {
      gameState: internal.gameState,
      processedActions,
    };
  }

  async dealNextHand(gameId: string): Promise<HandState | null> {
    const internal = activeGames.get(gameId);
    if (!internal) return null;

    const hand = internal.gameState.currentHand;
    if (hand && hand.status === 'in_progress') return null;

    // Rotate dealer
    internal.dealerIndex = (internal.dealerIndex + 1) % 6;

    // Deal new hand
    this.dealHand(internal);

    // Process bot actions until player's turn
    await this.processBotActions(internal);

    return internal.gameState.currentHand;
  }

  async getAvailableActions(gameId: string): Promise<AvailableActions | null> {
    const internal = activeGames.get(gameId);
    if (!internal) return null;

    const hand = internal.gameState.currentHand;
    if (!hand || !hand.isPlayerTurn || hand.status !== 'in_progress') return null;

    const playerInfo = internal.gameState.players.find((p) => p.isHuman);
    if (!playerInfo) return null;

    const handPlayer = hand.players.find((p) => p.playerId === playerInfo.playerId);
    if (!handPlayer) return null;

    return this.computeAvailableActions(handPlayer, hand, internal.blinds.bb);
  }

  async endGame(gameId: string): Promise<GameSummary | null> {
    const internal = activeGames.get(gameId);
    if (!internal) return null;

    const elapsed = (Date.now() - internal.startedAt) / 60000;

    const summary: GameSummary = {
      gameId,
      handsPlayed: internal.gameState.handCount,
      totalProfit: internal.gameState.sessionProfit,
      sessionDurationMinutes: Math.round(elapsed * 10) / 10,
    };

    activeGames.delete(gameId);
    return summary;
  }

  // ─── Internal Methods ───

  private dealHand(internal: InternalGameState): void {
    const gs = internal.gameState;
    const { sb, bb } = internal.blinds;

    // Reset deck
    internal.deck.reset();
    internal.deck.shuffle();
    internal.holeCards.clear();
    internal.streetHistory = [];
    internal.currentStreetActions = [];

    const handId = crypto.randomUUID();

    // Assign positions based on dealer index
    const handPlayers: HandPlayerState[] = [];

    for (let i = 0; i < 6; i++) {
      const seatIndex = (internal.dealerIndex + 1 + i) % 6;
      const playerInfo = gs.players[seatIndex];
      if (!playerInfo.isActive) continue;

      // Update position
      playerInfo.position = POSITIONS[i];

      // Deal hole cards
      const cards = internal.deck.deal(2);
      internal.holeCards.set(playerInfo.playerId, cards);

      handPlayers.push({
        playerId: playerInfo.playerId,
        position: POSITIONS[i],
        chipStack: playerInfo.chipStack,
        bet: 0,
        holeCards: playerInfo.isHuman ? cards : undefined,
        isFolded: false,
        isAllIn: false,
        hasActed: false,
      });
    }

    // Post blinds
    const sbIndex = handPlayers.findIndex((p) => p.position === 'SB');
    const bbIndex = handPlayers.findIndex((p) => p.position === 'BB');

    if (sbIndex >= 0) {
      const sbAmount = Math.min(sb, handPlayers[sbIndex].chipStack);
      handPlayers[sbIndex].bet = sbAmount;
      handPlayers[sbIndex].chipStack -= sbAmount;
      if (handPlayers[sbIndex].chipStack === 0) handPlayers[sbIndex].isAllIn = true;
    }

    if (bbIndex >= 0) {
      const bbAmount = Math.min(bb, handPlayers[bbIndex].chipStack);
      handPlayers[bbIndex].bet = bbAmount;
      handPlayers[bbIndex].chipStack -= bbAmount;
      if (handPlayers[bbIndex].chipStack === 0) handPlayers[bbIndex].isAllIn = true;
    }

    const totalBlinds = handPlayers.reduce((sum, p) => sum + p.bet, 0);

    // Find first to act preflop (UTG)
    const firstToActPos = this.getFirstToActPreflop(handPlayers);
    const firstToAct = handPlayers.find((p) => p.position === firstToActPos);

    const handState: HandState = {
      handId,
      street: 'preflop',
      pot: totalBlinds,
      communityCards: [],
      dealerPosition: POSITIONS[0], // BTN is always POSITIONS[3] from dealer perspective
      activePlayerId: firstToAct?.playerId ?? null,
      isPlayerTurn: firstToAct ? gs.players.find((p) => p.playerId === firstToAct.playerId)?.isHuman ?? false : false,
      players: handPlayers,
      status: 'in_progress',
    };

    // Set dealer position from the actual dealer
    const dealerPlayer = gs.players[internal.dealerIndex];
    if (dealerPlayer) {
      handState.dealerPosition = dealerPlayer.position;
    }

    gs.currentHand = handState;
    gs.handCount++;
    internal.streetPotStart = totalBlinds;
  }

  private getFirstToActPreflop(players: HandPlayerState[]): Position {
    // Preflop: UTG acts first, then HJ, CO, BTN, SB, BB
    const order: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of order) {
      const p = players.find((pl) => pl.position === pos && !pl.isFolded && !pl.isAllIn);
      if (p) return pos;
    }
    return 'UTG';
  }

  private getNextToAct(hand: HandState, currentPlayerId: string): string | null {
    const activePlayers = hand.players.filter((p) => !p.isFolded && !p.isAllIn);
    if (activePlayers.length <= 1) return null;

    // Postflop order: SB, BB, UTG, HJ, CO, BTN
    // Preflop order: UTG, HJ, CO, BTN, SB, BB
    const order: Position[] = hand.street === 'preflop'
      ? ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']
      : ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

    const currentIdx = order.indexOf(
      hand.players.find((p) => p.playerId === currentPlayerId)?.position ?? 'UTG'
    );

    // Find next player who hasn't acted or needs to respond to a raise
    const maxBet = Math.max(...hand.players.map((p) => p.bet));

    for (let i = 1; i <= order.length; i++) {
      const nextPos = order[(currentIdx + i) % order.length];
      const nextPlayer = activePlayers.find((p) => p.position === nextPos);
      if (nextPlayer && (!nextPlayer.hasActed || nextPlayer.bet < maxBet)) {
        return nextPlayer.playerId;
      }
    }

    return null;
  }

  private applyAction(internal: InternalGameState, playerId: string, action: PlayerAction): ActionEvent {
    const hand = internal.gameState.currentHand!;
    const player = hand.players.find((p) => p.playerId === playerId)!;
    const playerInfo = internal.gameState.players.find((p) => p.playerId === playerId)!;
    const maxBet = Math.max(...hand.players.map((p) => p.bet));
    const toCall = maxBet - player.bet;

    let amount = 0;

    switch (action.action) {
      case 'fold':
        player.isFolded = true;
        break;

      case 'check':
        // Nothing to do
        break;

      case 'call':
        amount = Math.min(toCall, player.chipStack);
        player.bet += amount;
        player.chipStack -= amount;
        playerInfo.chipStack = player.chipStack;
        hand.pot += amount;
        if (player.chipStack === 0) player.isAllIn = true;
        break;

      case 'raise': {
        const raiseAmount = action.amount ?? maxBet * 2;
        // Total bet this street should be raiseAmount
        const additionalChips = raiseAmount - player.bet;
        amount = Math.min(additionalChips, player.chipStack);
        player.bet += amount;
        player.chipStack -= amount;
        playerInfo.chipStack = player.chipStack;
        hand.pot += amount;
        if (player.chipStack === 0) player.isAllIn = true;
        // Reset hasActed for other players so they can respond
        for (const p of hand.players) {
          if (p.playerId !== playerId && !p.isFolded && !p.isAllIn) {
            p.hasActed = false;
          }
        }
        break;
      }

      case 'all_in':
        amount = player.chipStack;
        player.bet += amount;
        player.chipStack = 0;
        playerInfo.chipStack = 0;
        hand.pot += amount;
        player.isAllIn = true;
        // If this is a raise (bet > maxBet), reset hasActed for others
        if (player.bet > maxBet) {
          for (const p of hand.players) {
            if (p.playerId !== playerId && !p.isFolded && !p.isAllIn) {
              p.hasActed = false;
            }
          }
        }
        break;
    }

    player.hasActed = true;

    const event: ActionEvent = {
      playerId,
      playerName: playerInfo.name,
      position: player.position,
      action: action.action,
      amount: amount > 0 ? amount : undefined,
      street: hand.street,
      potAfter: hand.pot,
      timestamp: Date.now(),
    };

    internal.currentStreetActions.push(event);

    return event;
  }

  private checkStreetEnd(internal: InternalGameState): void {
    const hand = internal.gameState.currentHand!;
    const activePlayers = hand.players.filter((p) => !p.isFolded);

    // Only one player left — they win
    if (activePlayers.length === 1) {
      this.concludeHand(internal, false);
      return;
    }

    // Check if all active (non-all-in) players have acted and bets are equal
    const playersWhoCanAct = activePlayers.filter((p) => !p.isAllIn);
    const allActed = playersWhoCanAct.every((p) => p.hasActed);
    const maxBet = Math.max(...activePlayers.map((p) => p.bet));
    const betsEqual = playersWhoCanAct.every((p) => p.bet === maxBet);

    if (allActed && betsEqual) {
      // Check if everyone is all-in (or only one can act)
      if (playersWhoCanAct.length <= 1) {
        // Run out remaining streets
        this.runOutBoard(internal);
        return;
      }

      // Advance to next street
      this.advanceStreet(internal);
    }
  }

  private advanceStreet(internal: InternalGameState): void {
    const hand = internal.gameState.currentHand!;

    // Save current street record
    internal.streetHistory.push({
      street: hand.street,
      communityCards: hand.street === 'preflop' ? undefined : [...hand.communityCards],
      actions: [...internal.currentStreetActions],
      potAtStart: internal.streetPotStart,
      potAtEnd: hand.pot,
    });

    internal.currentStreetActions = [];
    internal.streetPotStart = hand.pot;

    // Reset per-street state
    for (const p of hand.players) {
      p.bet = 0;
      p.hasActed = false;
    }

    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = streetOrder.indexOf(hand.street);

    if (currentIndex >= 3) {
      // After river — showdown
      this.concludeHand(internal, true);
      return;
    }

    const nextStreet = streetOrder[currentIndex + 1];
    hand.street = nextStreet;

    // Deal community cards
    let newCards: Card[] = [];
    if (nextStreet === 'flop') {
      newCards = internal.deck.deal(3);
    } else {
      newCards = internal.deck.deal(1);
    }
    hand.communityCards.push(...newCards);

    // Find first to act postflop (SB or next active player)
    const postflopOrder: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];
    let nextActor: string | null = null;
    for (const pos of postflopOrder) {
      const p = hand.players.find((pl) => pl.position === pos && !pl.isFolded && !pl.isAllIn);
      if (p) {
        nextActor = p.playerId;
        break;
      }
    }

    hand.activePlayerId = nextActor;
    const humanPlayer = internal.gameState.players.find((p) => p.isHuman);
    hand.isPlayerTurn = nextActor === humanPlayer?.playerId;
  }

  private runOutBoard(internal: InternalGameState): void {
    const hand = internal.gameState.currentHand!;

    // Save current street
    internal.streetHistory.push({
      street: hand.street,
      communityCards: hand.street === 'preflop' ? undefined : [...hand.communityCards],
      actions: [...internal.currentStreetActions],
      potAtStart: internal.streetPotStart,
      potAtEnd: hand.pot,
    });

    // Deal remaining community cards
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    let idx = streetOrder.indexOf(hand.street);

    while (idx < 3) {
      idx++;
      const street = streetOrder[idx];
      if (street === 'flop') {
        hand.communityCards.push(...internal.deck.deal(3));
      } else {
        hand.communityCards.push(...internal.deck.deal(1));
      }
      internal.streetHistory.push({
        street,
        communityCards: [...hand.communityCards],
        actions: [],
        potAtStart: hand.pot,
        potAtEnd: hand.pot,
      });
    }

    hand.street = 'river';
    this.concludeHand(internal, true);
  }

  private concludeHand(internal: InternalGameState, showdown: boolean): void {
    const hand = internal.gameState.currentHand!;
    const gs = internal.gameState;
    const activePlayers = hand.players.filter((p) => !p.isFolded);

    // Save final street if not already saved
    if (internal.currentStreetActions.length > 0) {
      internal.streetHistory.push({
        street: hand.street,
        communityCards: hand.street === 'preflop' ? undefined : [...hand.communityCards],
        actions: [...internal.currentStreetActions],
        potAtStart: internal.streetPotStart,
        potAtEnd: hand.pot,
      });
      internal.currentStreetActions = [];
    }

    const humanPlayer = gs.players.find((p) => p.isHuman)!;
    const humanHandPlayer = hand.players.find((p) => p.playerId === humanPlayer.playerId)!;

    if (activePlayers.length === 1) {
      // Single winner (everyone else folded)
      const winner = activePlayers[0];
      winner.chipStack += hand.pot;
      const winnerInfo = gs.players.find((p) => p.playerId === winner.playerId)!;
      winnerInfo.chipStack = winner.chipStack;

      const invested = this.getPlayerInvestment(internal, humanPlayer.playerId);
      const profit = winner.playerId === humanPlayer.playerId ? hand.pot - invested : -invested;

      hand.result = {
        winners: [{ playerId: winner.playerId, amount: hand.pot }],
        playerProfit: profit,
      };
    } else {
      // Showdown — evaluate hands
      const handsToEval = activePlayers
        .filter((p) => internal.holeCards.has(p.playerId))
        .map((p) => ({
          playerId: p.playerId,
          holeCards: internal.holeCards.get(p.playerId)!,
        }));

      const result = internal.evaluator.compareHands(handsToEval, hand.communityCards);

      // Distribute pot among winners
      const winShare = hand.pot / result.winners.length;
      for (const winnerId of result.winners) {
        const wp = hand.players.find((p) => p.playerId === winnerId)!;
        wp.chipStack += winShare;
        const wpInfo = gs.players.find((p) => p.playerId === winnerId)!;
        wpInfo.chipStack = wp.chipStack;
      }

      const invested = this.getPlayerInvestment(internal, humanPlayer.playerId);
      const humanWon = result.winners.includes(humanPlayer.playerId);
      const profit = humanWon ? winShare - invested : -invested;

      hand.result = {
        winners: result.winners.map((wid) => {
          const eval_ = result.evaluations.find((e) => e.playerId === wid);
          return {
            playerId: wid,
            amount: winShare,
            handRank: eval_?.rank,
            bestFiveCards: eval_?.bestFiveCards,
          };
        }),
        playerProfit: profit,
      };

      // Reveal all hole cards at showdown
      if (showdown) {
        for (const hp of hand.players) {
          hp.holeCards = internal.holeCards.get(hp.playerId);
        }
      }
    }

    hand.status = showdown ? 'showdown' : 'concluded';
    hand.activePlayerId = null;
    hand.isPlayerTurn = false;

    gs.sessionProfit += hand.result.playerProfit;

    // Mark busted players as inactive
    for (const p of gs.players) {
      if (p.chipStack <= 0) p.isActive = false;
    }

    // Save hand record
    this.saveHandRecord(internal);
  }

  private getPlayerInvestment(internal: InternalGameState, playerId: string): number {
    let invested = 0;
    for (const street of internal.streetHistory) {
      for (const action of street.actions) {
        if (action.playerId === playerId && action.amount) {
          invested += action.amount;
        }
      }
    }
    return invested;
  }

  private saveHandRecord(internal: InternalGameState): void {
    const hand = internal.gameState.currentHand!;
    const gs = internal.gameState;

    const record: HandRecord = {
      handId: hand.handId,
      playedAt: new Date().toISOString(),
      blindLevel: gs.blindLevel,
      dealerPosition: hand.dealerPosition,
      players: gs.players.map((p) => ({
        playerId: p.playerId,
        name: p.name,
        position: p.position,
        startingStack: p.chipStack + (hand.result?.winners.find((w) => w.playerId === p.playerId)?.amount ?? 0),
        holeCards: internal.holeCards.get(p.playerId) ?? [],
        isHuman: p.isHuman,
        botStyle: internal.botStyles.get(p.playerId),
      })),
      streets: internal.streetHistory,
      result: hand.result!,
    };

    internal.handRecords.push(record);
  }

  private async processBotActions(internal: InternalGameState): Promise<ActionEvent[]> {
    const hand = internal.gameState.currentHand;
    if (!hand || hand.status !== 'in_progress') return [];

    const events: ActionEvent[] = [];
    const humanPlayer = internal.gameState.players.find((p) => p.isHuman);

    // Process bot turns until it's the player's turn or hand ends
    while (hand.activePlayerId && hand.activePlayerId !== humanPlayer?.playerId && hand.status === 'in_progress') {
      const botId = hand.activePlayerId;
      const botStyle = internal.botStyles.get(botId);
      if (!botStyle) break;

      // Get GTO recommendation for this situation
      const botHoleCards = internal.holeCards.get(botId);
      const botPlayer = hand.players.find((p) => p.playerId === botId);
      let gtoRec = { actions: [], scenario: '', explanation: '' } as import('../types').GTORecommendation;

      if (botHoleCards && botPlayer) {
        try {
          gtoRec = gtoService.lookup({
            holeCards: botHoleCards,
            position: botPlayer.position,
            street: hand.street,
            communityCards: hand.communityCards,
            potSize: hand.pot,
          });
        } catch {
          // Use empty GTO rec; bot falls back to heuristics
        }
      }

      const action = botEngine.decide(botId, botStyle, internal.gameState, gtoRec);
      const event = this.applyAction(internal, botId, action);
      events.push(event);

      // Check if street/hand ends
      this.checkStreetEnd(internal);

      if (hand.status !== 'in_progress') break;

      // Move to next player
      const nextId = this.getNextToAct(hand, botId);
      hand.activePlayerId = nextId;
      hand.isPlayerTurn = nextId === humanPlayer?.playerId;

      if (!nextId) {
        // Everyone has acted, street should advance
        this.checkStreetEnd(internal);
        break;
      }
    }

    return events;
  }

  private computeAvailableActions(
    player: HandPlayerState,
    hand: HandState,
    bb: number
  ): AvailableActions {
    const maxBet = Math.max(...hand.players.filter((p) => !p.isFolded).map((p) => p.bet));
    const toCall = maxBet - player.bet;
    const pot = hand.pot;
    const canCheck = toCall === 0;

    const actions: ActionType[] = [];

    if (canCheck) {
      actions.push('check');
    } else {
      actions.push('fold');
      if (player.chipStack >= toCall) {
        actions.push('call');
      }
    }

    const minRaiseSize = Math.max(maxBet + bb, maxBet * 2);
    const raiseAdditional = minRaiseSize - player.bet;
    if (player.chipStack > toCall && player.chipStack >= raiseAdditional) {
      actions.push('raise');
    }

    if (player.chipStack > 0) {
      actions.push('all_in');
    }

    const minRaise = minRaiseSize;
    const maxRaise = player.chipStack + player.bet;

    // Compute presets
    const presets: { label: string; amount: number }[] = [];
    const totalPot = pot + toCall; // pot after calling

    const presetSizes = [
      { label: '1/3 pot', factor: 1 / 3 },
      { label: '1/2 pot', factor: 0.5 },
      { label: '2/3 pot', factor: 2 / 3 },
      { label: 'Pot', factor: 1 },
    ];

    for (const ps of presetSizes) {
      const amount = Math.round(totalPot * ps.factor) + maxBet;
      if (amount >= minRaise && amount <= maxRaise) {
        presets.push({ label: ps.label, amount });
      }
    }

    // Always include all-in as a preset
    if (player.chipStack > 0) {
      presets.push({ label: 'All-in', amount: maxRaise });
    }

    return {
      actions,
      potSize: pot,
      toCall,
      minRaise: actions.includes('raise') ? minRaise : undefined,
      maxRaise: actions.includes('raise') || actions.includes('all_in') ? maxRaise : undefined,
      presetRaiseSizes: presets.length > 0 ? presets : undefined,
    };
  }

  /**
   * Get hand records for history persistence.
   */
  getHandRecords(gameId: string): HandRecord[] {
    const internal = activeGames.get(gameId);
    return internal?.handRecords ?? [];
  }
}

export const gameService = new GameService();
