import type {
  GameState,
  HandState,
  PlayerAction,
  ActionResult,
  AvailableActions,
  CreateGameRequest,
  GameSummary,
} from '../types';

export class GameEngine {
  createGame(config: CreateGameRequest): GameState {
    return {
      gameId: crypto.randomUUID(),
      blindLevel: config.blindLevel,
      speed: config.speed ?? 'normal',
      players: [],
      currentHand: null,
      handCount: 0,
      sessionProfit: 0,
    };
  }

  getGameState(_gameId: string): GameState | null {
    return null;
  }

  dealNextHand(_gameId: string): HandState | null {
    return null;
  }

  submitAction(_gameId: string, _action: PlayerAction): ActionResult | null {
    return null;
  }

  getAvailableActions(_gameId: string): AvailableActions | null {
    return null;
  }

  endGame(_gameId: string): GameSummary | null {
    return null;
  }
}
