import type {
  GameState,
  HandState,
  PlayerAction,
  ActionResult,
  AvailableActions,
  CreateGameRequest,
  GameSummary,
  PlayerInfo,
  HandPlayerState,
  ActionEvent,
  Position,
  Street,
  BlindLevel,
  Card,
  BotStyle,
  HandResult,
} from '../types';
import { Deck } from './deck';
import { HandEvaluator } from './hand-evaluator';
import { PotManager } from './pot-manager';

const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

const BLIND_VALUES: Record<BlindLevel, { small: number; big: number }> = {
  '1/2': { small: 1, big: 2 },
  '2/5': { small: 2, big: 5 },
  '5/10': { small: 5, big: 10 },
};

const BOT_NAMES = ['Alex', 'Blake', 'Casey', 'Dana', 'Eli', 'Finn', 'Gale', 'Harper', 'Ira', 'Jules'];
const BOT_STYLES: BotStyle[] = ['TAG', 'LAG', 'Fish', 'Nit', 'Maniac'];

interface InternalGame {
  state: GameState;
  deck: Deck;
  potManager: PotManager;
  evaluator: HandEvaluator;
  dealerIndex: number;
  /** Cumulative bets per player for the current hand (for side pot calculation) */
  handBets: Map<string, number>;
  /** Tracks the current bet level on the current street */
  currentBetLevel: number;
  /** Number of raises on the current street */
  raiseCount: number;
  /** Start time for session duration */
  startTime: number;
  /** Human player ID */
  humanPlayerId: string;
  /** Action log for the current hand */
  actionLog: ActionEvent[];
  /** Timestamp counter for animation sequencing */
  tsCounter: number;
}

export class GameEngine {
  private games = new Map<string, InternalGame>();

  createGame(config: CreateGameRequest): GameState {
    const gameId = crypto.randomUUID();
    const blinds = BLIND_VALUES[config.blindLevel];
    const stackBB = config.startingStackBB ?? 100;
    const startingChips = stackBB * blinds.big;

    // Pick random seat for human
    const humanSeatIndex = Math.floor(Math.random() * 6);

    // Shuffle bot styles and names
    const shuffledStyles = [...BOT_STYLES].sort(() => Math.random() - 0.5);
    const shuffledNames = [...BOT_NAMES].sort(() => Math.random() - 0.5);

    const players: PlayerInfo[] = [];
    let botIdx = 0;
    let humanPlayerId = '';

    for (let i = 0; i < 6; i++) {
      if (i === humanSeatIndex) {
        const pid = crypto.randomUUID();
        humanPlayerId = pid;
        players.push({
          playerId: pid,
          name: 'You',
          position: POSITIONS[i],
          chipStack: startingChips,
          isHuman: true,
          isActive: true,
        });
      } else {
        players.push({
          playerId: crypto.randomUUID(),
          name: shuffledNames[botIdx],
          position: POSITIONS[i],
          chipStack: startingChips,
          isHuman: false,
          isActive: true,
          botStyle: shuffledStyles[botIdx % shuffledStyles.length],
        });
        botIdx++;
      }
    }

    const gameState: GameState = {
      gameId,
      blindLevel: config.blindLevel,
      speed: config.speed ?? 'normal',
      players,
      currentHand: null,
      handCount: 0,
      sessionProfit: 0,
    };

    const game: InternalGame = {
      state: gameState,
      deck: new Deck(),
      potManager: new PotManager(),
      evaluator: new HandEvaluator(),
      dealerIndex: Math.floor(Math.random() * 6),
      handBets: new Map(),
      currentBetLevel: 0,
      raiseCount: 0,
      startTime: Date.now(),
      humanPlayerId,
      actionLog: [],
      tsCounter: 0,
    };

    this.games.set(gameId, game);

    // Deal the first hand
    this.dealNewHand(game);

    return { ...game.state };
  }

  getGameState(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;
    return { ...game.state };
  }

  dealNextHand(gameId: string): HandState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    // Can only deal if no hand in progress
    if (game.state.currentHand && game.state.currentHand.status === 'in_progress') {
      return null;
    }

    // Rotate dealer
    game.dealerIndex = this.nextActiveSeatIndex(game, game.dealerIndex);
    this.dealNewHand(game);
    return game.state.currentHand ? { ...game.state.currentHand } : null;
  }

  submitAction(gameId: string, action: PlayerAction): ActionResult | null {
    const game = this.games.get(gameId);
    if (!game || !game.state.currentHand) return null;

    const hand = game.state.currentHand;
    if (hand.status !== 'in_progress' || !hand.activePlayerId) return null;

    const processedActions: ActionEvent[] = [];

    // Process the submitted action
    this.processAction(game, hand.activePlayerId, action, processedActions);

    // Check if hand is over after this action
    if (hand.status === 'in_progress') {
      this.advanceToNextPlayer(game, processedActions);
    }

    return {
      gameState: { ...game.state },
      processedActions,
    };
  }

  getAvailableActions(gameId: string): AvailableActions | null {
    const game = this.games.get(gameId);
    if (!game || !game.state.currentHand) return null;

    const hand = game.state.currentHand;
    if (hand.status !== 'in_progress' || !hand.activePlayerId) return null;

    return this.computeAvailableActions(game, hand.activePlayerId);
  }

  endGame(gameId: string): GameSummary | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const durationMs = Date.now() - game.startTime;
    const summary: GameSummary = {
      gameId,
      handsPlayed: game.state.handCount,
      totalProfit: game.state.sessionProfit,
      sessionDurationMinutes: Math.round(durationMs / 60000 * 10) / 10,
    };

    this.games.delete(gameId);
    return summary;
  }

  // ========================
  // Internal Methods
  // ========================

  private dealNewHand(game: InternalGame): void {
    const blinds = BLIND_VALUES[game.state.blindLevel];

    // Reset deck and pot
    game.deck.reset();
    game.deck.shuffle();
    game.potManager.reset();
    game.handBets = new Map();
    game.currentBetLevel = blinds.big;
    game.raiseCount = 0;
    game.actionLog = [];
    game.tsCounter = 0;

    const handId = crypto.randomUUID();

    // Assign positions based on dealer index
    const activePlayers = game.state.players.filter((p) => p.isActive);
    if (activePlayers.length < 2) return;

    // Reassign positions relative to dealer
    for (let i = 0; i < 6; i++) {
      const seatIdx = (game.dealerIndex + i) % 6;
      game.state.players[seatIdx].position = POSITIONS[i === 0 ? 3 : i === 1 ? 4 : i === 2 ? 5 : i - 3];
    }

    // Remap: dealer=BTN, dealer+1=SB, dealer+2=BB, dealer+3=UTG, dealer+4=HJ, dealer+5=CO
    const posMap = [3, 4, 5, 0, 1, 2]; // BTN, SB, BB, UTG, HJ, CO
    for (let i = 0; i < 6; i++) {
      const seatIdx = (game.dealerIndex + i) % 6;
      game.state.players[seatIdx].position = POSITIONS[posMap[i]];
    }

    // Build hand player states
    const handPlayers: HandPlayerState[] = game.state.players.map((p) => ({
      playerId: p.playerId,
      position: p.position,
      chipStack: p.chipStack,
      bet: 0,
      holeCards: undefined,
      isFolded: !p.isActive,
      isAllIn: false,
      hasActed: false,
    }));

    // Deal 2 hole cards to each active player
    for (const hp of handPlayers) {
      if (!hp.isFolded) {
        hp.holeCards = game.deck.deal(2);
      }
    }

    // Post blinds
    const sbPlayer = handPlayers.find((p) => p.position === 'SB' && !p.isFolded);
    const bbPlayer = handPlayers.find((p) => p.position === 'BB' && !p.isFolded);

    if (sbPlayer) {
      const sbAmount = Math.min(blinds.small, sbPlayer.chipStack);
      sbPlayer.bet = sbAmount;
      sbPlayer.chipStack -= sbAmount;
      if (sbPlayer.chipStack === 0) sbPlayer.isAllIn = true;
      game.potManager.addBet(sbAmount);
      game.handBets.set(sbPlayer.playerId, sbAmount);
    }

    if (bbPlayer) {
      const bbAmount = Math.min(blinds.big, bbPlayer.chipStack);
      bbPlayer.bet = bbAmount;
      bbPlayer.chipStack -= bbAmount;
      if (bbPlayer.chipStack === 0) bbPlayer.isAllIn = true;
      game.potManager.addBet(bbAmount);
      game.handBets.set(bbPlayer.playerId, bbAmount);
    }

    const dealerPos = game.state.players[game.dealerIndex].position;

    const hand: HandState = {
      handId,
      street: 'preflop',
      pot: game.potManager.getTotalPot(),
      mainPot: game.potManager.getMainPot(),
      sidePots: game.potManager.getSidePots(),
      communityCards: [],
      dealerPosition: dealerPos,
      activePlayerId: null,
      isPlayerTurn: false,
      players: handPlayers,
      status: 'in_progress',
    };

    game.state.currentHand = hand;
    game.state.handCount++;

    // Set first actor: preflop starts UTG
    const firstActor = this.getFirstActorPreflop(game);
    if (firstActor) {
      hand.activePlayerId = firstActor;
      hand.isPlayerTurn = firstActor === game.humanPlayerId;
    }
  }

  private processAction(
    game: InternalGame,
    playerId: string,
    action: PlayerAction,
    processedActions: ActionEvent[]
  ): void {
    const hand = game.state.currentHand!;
    const player = hand.players.find((p) => p.playerId === playerId)!;
    const playerInfo = game.state.players.find((p) => p.playerId === playerId)!;
    const blinds = BLIND_VALUES[game.state.blindLevel];

    switch (action.action) {
      case 'fold': {
        player.isFolded = true;
        player.hasActed = true;
        break;
      }
      case 'check': {
        player.hasActed = true;
        break;
      }
      case 'call': {
        const toCall = game.currentBetLevel - player.bet;
        const actualCall = Math.min(toCall, player.chipStack);
        player.chipStack -= actualCall;
        player.bet += actualCall;
        if (player.chipStack === 0) player.isAllIn = true;
        game.potManager.addBet(actualCall);
        game.handBets.set(playerId, (game.handBets.get(playerId) ?? 0) + actualCall);
        player.hasActed = true;
        break;
      }
      case 'raise': {
        const raiseAmount = action.amount ?? game.currentBetLevel * 2;
        const totalBet = raiseAmount;
        const additional = totalBet - player.bet;
        const actualAdd = Math.min(additional, player.chipStack);
        player.chipStack -= actualAdd;
        player.bet += actualAdd;
        if (player.chipStack === 0) player.isAllIn = true;
        game.currentBetLevel = player.bet;
        game.raiseCount++;
        game.potManager.addBet(actualAdd);
        game.handBets.set(playerId, (game.handBets.get(playerId) ?? 0) + actualAdd);
        player.hasActed = true;

        // Reset hasActed for other active players (they need to act again)
        for (const p of hand.players) {
          if (p.playerId !== playerId && !p.isFolded && !p.isAllIn) {
            p.hasActed = false;
          }
        }
        break;
      }
      case 'all_in': {
        const allInAmount = player.chipStack;
        player.bet += allInAmount;
        player.chipStack = 0;
        player.isAllIn = true;
        if (player.bet > game.currentBetLevel) {
          game.currentBetLevel = player.bet;
          game.raiseCount++;
          // Reset hasActed for other active players
          for (const p of hand.players) {
            if (p.playerId !== playerId && !p.isFolded && !p.isAllIn) {
              p.hasActed = false;
            }
          }
        }
        game.potManager.addBet(allInAmount);
        game.handBets.set(playerId, (game.handBets.get(playerId) ?? 0) + allInAmount);
        player.hasActed = true;
        break;
      }
    }

    // Sync chip stacks back to playerInfo
    playerInfo.chipStack = player.chipStack;

    // Update pot display
    hand.pot = game.potManager.getTotalPot();

    const evt: ActionEvent = {
      playerId,
      playerName: playerInfo.name,
      position: player.position,
      action: action.action,
      amount: action.action === 'call'
        ? game.currentBetLevel - (player.bet - Math.min(game.currentBetLevel - (player.bet - (player.bet)), player.chipStack + (player.bet)))
        : action.amount,
      street: hand.street,
      potAfter: hand.pot,
      timestamp: game.tsCounter++,
    };
    processedActions.push(evt);
    game.actionLog.push(evt);
  }

  private advanceToNextPlayer(game: InternalGame, processedActions: ActionEvent[]): void {
    const hand = game.state.currentHand!;

    // Check if hand should end
    const activePlayers = hand.players.filter((p) => !p.isFolded);
    const nonFoldedNonAllIn = activePlayers.filter((p) => !p.isAllIn);

    // Everyone folded except one
    if (activePlayers.length === 1) {
      this.concludeHandFold(game, activePlayers[0].playerId);
      return;
    }

    // All remaining players are all-in (or only one non-all-in left and they've acted)
    if (nonFoldedNonAllIn.length <= 1) {
      const allActed = nonFoldedNonAllIn.every((p) => p.hasActed);
      if (allActed || nonFoldedNonAllIn.length === 0) {
        // Run out remaining community cards
        this.runOutBoard(game, processedActions);
        this.concludeHandShowdown(game);
        return;
      }
    }

    // Check if the street betting round is complete
    const streetComplete = this.isStreetComplete(game);
    if (streetComplete) {
      this.advanceStreet(game, processedActions);
      return;
    }

    // Find next player to act
    const nextPlayer = this.getNextActor(game);
    if (!nextPlayer) {
      // No one left to act - advance street
      this.advanceStreet(game, processedActions);
      return;
    }

    hand.activePlayerId = nextPlayer;
    hand.isPlayerTurn = nextPlayer === game.humanPlayerId;
  }

  private isStreetComplete(game: InternalGame): boolean {
    const hand = game.state.currentHand!;
    const activePlayers = hand.players.filter((p) => !p.isFolded && !p.isAllIn);

    // All active players must have acted
    if (!activePlayers.every((p) => p.hasActed)) return false;

    // All active players must have matching bets (or be all-in)
    const bets = activePlayers.map((p) => p.bet);
    if (bets.length > 0 && !bets.every((b) => b === bets[0])) return false;

    return true;
  }

  private advanceStreet(game: InternalGame, processedActions: ActionEvent[]): void {
    const hand = game.state.currentHand!;

    // Collect bets into pot and reset for new street
    for (const p of hand.players) {
      p.bet = 0;
      if (!p.isFolded && !p.isAllIn) {
        p.hasActed = false;
      }
    }
    game.currentBetLevel = 0;
    game.raiseCount = 0;

    // Calculate side pots
    const bets = hand.players
      .filter((p) => !p.isFolded)
      .map((p) => ({
        playerId: p.playerId,
        amount: game.handBets.get(p.playerId) ?? 0,
        isAllIn: p.isAllIn,
      }));
    game.potManager.calculateSidePots(bets);
    hand.mainPot = game.potManager.getMainPot();
    hand.sidePots = game.potManager.getSidePots();
    hand.pot = game.potManager.getTotalPot();

    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIdx = streetOrder.indexOf(hand.street);

    if (currentIdx >= 3) {
      // After river, go to showdown
      this.concludeHandShowdown(game);
      return;
    }

    const nextStreet = streetOrder[currentIdx + 1];
    hand.street = nextStreet;

    // Deal community cards
    let newCards: Card[] = [];
    if (nextStreet === 'flop') {
      newCards = game.deck.deal(3);
    } else if (nextStreet === 'turn' || nextStreet === 'river') {
      newCards = game.deck.deal(1);
    }
    hand.communityCards = [...hand.communityCards, ...newCards];

    // Create street transition event
    const transitionEvt: ActionEvent = {
      playerId: '',
      position: hand.dealerPosition,
      action: 'check',
      street: nextStreet,
      potAfter: hand.pot,
      timestamp: game.tsCounter++,
      isStreetTransition: true,
      newCommunityCards: newCards,
    };
    processedActions.push(transitionEvt);

    // Set first actor post-flop: SB or first active player after dealer
    const firstActor = this.getFirstActorPostflop(game);
    if (!firstActor) {
      // All players are all-in, run out board
      if (currentIdx + 1 < 3) {
        this.advanceStreet(game, processedActions);
      } else {
        this.concludeHandShowdown(game);
      }
      return;
    }

    hand.activePlayerId = firstActor;
    hand.isPlayerTurn = firstActor === game.humanPlayerId;
  }

  private runOutBoard(game: InternalGame, processedActions: ActionEvent[]): void {
    const hand = game.state.currentHand!;
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    let currentIdx = streetOrder.indexOf(hand.street);

    while (currentIdx < 3) {
      currentIdx++;
      const nextStreet = streetOrder[currentIdx];
      hand.street = nextStreet;

      let newCards: Card[] = [];
      if (nextStreet === 'flop') {
        newCards = game.deck.deal(3);
      } else {
        newCards = game.deck.deal(1);
      }
      hand.communityCards = [...hand.communityCards, ...newCards];

      processedActions.push({
        playerId: '',
        position: hand.dealerPosition,
        action: 'check',
        street: nextStreet,
        potAfter: hand.pot,
        timestamp: game.tsCounter++,
        isStreetTransition: true,
        newCommunityCards: newCards,
      });
    }
  }

  private concludeHandFold(game: InternalGame, winnerId: string): void {
    const hand = game.state.currentHand!;
    const pot = game.potManager.getTotalPot();

    // Award pot to winner
    const winnerInfo = game.state.players.find((p) => p.playerId === winnerId)!;
    const winnerHandPlayer = hand.players.find((p) => p.playerId === winnerId)!;
    winnerHandPlayer.chipStack += pot;
    winnerInfo.chipStack = winnerHandPlayer.chipStack;

    const humanPlayer = hand.players.find((p) => p.playerId === game.humanPlayerId)!;
    const humanBet = game.handBets.get(game.humanPlayerId) ?? 0;
    const playerProfit = winnerId === game.humanPlayerId ? pot - humanBet : -humanBet;

    hand.result = {
      winners: [{ playerId: winnerId, amount: pot }],
      playerProfit,
    };

    hand.status = 'concluded';
    hand.activePlayerId = null;
    hand.isPlayerTurn = false;
    game.state.sessionProfit += playerProfit;

    // Deactivate busted players
    this.deactivateBustedPlayers(game);
  }

  private concludeHandShowdown(game: InternalGame): void {
    const hand = game.state.currentHand!;

    // Calculate side pots first
    const bets = hand.players
      .filter((p) => !p.isFolded)
      .map((p) => ({
        playerId: p.playerId,
        amount: game.handBets.get(p.playerId) ?? 0,
        isAllIn: p.isAllIn,
      }));
    game.potManager.calculateSidePots(bets);

    const activePlayers = hand.players.filter((p) => !p.isFolded);
    const mainPot = game.potManager.getMainPot();
    const sidePots = game.potManager.getSidePots();
    const allPots = [
      { amount: mainPot, eligiblePlayerIds: activePlayers.map((p) => p.playerId) },
      ...sidePots,
    ];

    const winners: HandResult['winners'] = [];
    const winnings = new Map<string, number>();

    for (const pot of allPots) {
      if (pot.amount === 0) continue;

      const eligible = activePlayers.filter((p) => pot.eligiblePlayerIds.includes(p.playerId));
      if (eligible.length === 0) continue;

      const evalHands = eligible.map((p) => ({
        playerId: p.playerId,
        holeCards: p.holeCards ?? [],
      }));

      const result = game.evaluator.compareHands(evalHands, hand.communityCards);
      const potWinnerIds = result.winners;
      const share = Math.floor(pot.amount / potWinnerIds.length);
      const remainder = pot.amount - share * potWinnerIds.length;

      for (let i = 0; i < potWinnerIds.length; i++) {
        const wid = potWinnerIds[i];
        const amt = share + (i === 0 ? remainder : 0);
        winnings.set(wid, (winnings.get(wid) ?? 0) + amt);

        const eval_ = result.evaluations.find((e) => e.playerId === wid);
        const existing = winners.find((w) => w.playerId === wid);
        if (!existing) {
          winners.push({
            playerId: wid,
            amount: amt,
            handRank: eval_?.rank,
            bestFiveCards: eval_?.bestFiveCards,
          });
        } else {
          existing.amount += amt;
        }
      }
    }

    // Distribute winnings
    for (const [pid, amount] of winnings) {
      const hp = hand.players.find((p) => p.playerId === pid)!;
      const pi = game.state.players.find((p) => p.playerId === pid)!;
      hp.chipStack += amount;
      pi.chipStack = hp.chipStack;
    }

    const humanBet = game.handBets.get(game.humanPlayerId) ?? 0;
    const humanWinnings = winnings.get(game.humanPlayerId) ?? 0;
    const playerProfit = humanWinnings - humanBet;

    hand.result = { winners, playerProfit };
    hand.status = 'showdown';
    hand.activePlayerId = null;
    hand.isPlayerTurn = false;
    game.state.sessionProfit += playerProfit;

    this.deactivateBustedPlayers(game);
  }

  private computeAvailableActions(game: InternalGame, playerId: string): AvailableActions {
    const hand = game.state.currentHand!;
    const player = hand.players.find((p) => p.playerId === playerId)!;
    const blinds = BLIND_VALUES[game.state.blindLevel];
    const pot = game.potManager.getTotalPot();

    const toCall = game.currentBetLevel - player.bet;
    const actions: AvailableActions['actions'] = [];

    if (toCall > 0) {
      actions.push('fold');
      if (toCall >= player.chipStack) {
        // Can only call all-in
        actions.push('all_in');
      } else {
        actions.push('call');
        // Can raise
        const minRaise = Math.min(game.currentBetLevel + blinds.big, player.chipStack + player.bet);
        if (player.chipStack > toCall) {
          actions.push('raise');
        }
        actions.push('all_in');
      }
    } else {
      // No bet to call
      actions.push('check');
      if (player.chipStack > 0) {
        actions.push('raise');
        actions.push('all_in');
      }
    }

    const minRaise = game.currentBetLevel + blinds.big;
    const maxRaise = player.chipStack + player.bet;

    // Preset raise sizes
    const presets: { label: string; amount: number }[] = [];
    const potForSizing = pot + toCall; // effective pot after calling
    const sizings = [
      { label: '1/3 pot', factor: 1 / 3 },
      { label: '1/2 pot', factor: 1 / 2 },
      { label: '2/3 pot', factor: 2 / 3 },
      { label: 'Pot', factor: 1 },
    ];

    for (const s of sizings) {
      const raiseSize = Math.round(player.bet + toCall + potForSizing * s.factor);
      if (raiseSize >= minRaise && raiseSize < maxRaise) {
        presets.push({ label: s.label, amount: raiseSize });
      }
    }
    if (player.chipStack > 0) {
      presets.push({ label: 'All-In', amount: maxRaise });
    }

    return {
      actions,
      potSize: pot,
      toCall: Math.min(toCall, player.chipStack),
      minRaise,
      maxRaise,
      presetRaiseSizes: presets,
    };
  }

  private getFirstActorPreflop(game: InternalGame): string | null {
    const hand = game.state.currentHand!;
    // Preflop action starts with UTG
    const order: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    for (const pos of order) {
      const player = hand.players.find((p) => p.position === pos && !p.isFolded && !p.isAllIn);
      if (player) return player.playerId;
    }
    return null;
  }

  private getFirstActorPostflop(game: InternalGame): string | null {
    const hand = game.state.currentHand!;
    // Post-flop action starts with SB, then BB, UTG, etc.
    const order: Position[] = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];
    for (const pos of order) {
      const player = hand.players.find((p) => p.position === pos && !p.isFolded && !p.isAllIn);
      if (player) return player.playerId;
    }
    return null;
  }

  private getNextActor(game: InternalGame): string | null {
    const hand = game.state.currentHand!;
    const current = hand.activePlayerId;
    if (!current) return null;

    const isPreflop = hand.street === 'preflop';
    const order: Position[] = isPreflop
      ? ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']
      : ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'];

    const currentPlayer = hand.players.find((p) => p.playerId === current)!;
    const currentPosIdx = order.indexOf(currentPlayer.position);

    // Search from next position onward (wrapping around)
    for (let i = 1; i <= 6; i++) {
      const pos = order[(currentPosIdx + i) % 6];
      const player = hand.players.find((p) => p.position === pos && !p.isFolded && !p.isAllIn && !p.hasActed);
      if (player) return player.playerId;
    }

    return null;
  }

  private nextActiveSeatIndex(game: InternalGame, fromIndex: number): number {
    for (let i = 1; i <= 6; i++) {
      const idx = (fromIndex + i) % 6;
      if (game.state.players[idx].isActive) return idx;
    }
    return fromIndex;
  }

  private deactivateBustedPlayers(game: InternalGame): void {
    for (const p of game.state.players) {
      if (p.chipStack <= 0) {
        p.isActive = false;
      }
    }
  }
}
