import type {
  GTOLookupRequest,
  GTORecommendation,
  PreflopHandStrategy,
  PostflopStrategyData,
  Position,
  BoardTexture,
  Street,
} from '../types';
import { loadPreflopData, getPreflopData } from './preflop-data';
import { loadPostflopData } from './postflop-loader';
import { classifyBoard } from './board-classifier';

export class GTOService {
  async init(): Promise<void> {
    await loadPreflopData();
  }

  getPreflopStrategy(_position: Position, _scenario: string): PreflopHandStrategy[] {
    const data = getPreflopData();
    if (!data) return [];
    return [];
  }

  async getPostflopStrategy(
    boardTexture: BoardTexture,
    street: Street,
    _scenario?: string
  ): Promise<PostflopStrategyData> {
    return loadPostflopData(boardTexture, street);
  }

  lookup(_request: GTOLookupRequest): GTORecommendation {
    return {
      actions: [],
      scenario: '',
      explanation: '',
    };
  }

  classifyBoard = classifyBoard;
}

export const gtoService = new GTOService();
