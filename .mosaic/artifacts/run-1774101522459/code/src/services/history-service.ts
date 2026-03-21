// ============================================================
// History Service — Hand history retrieval and management
// ============================================================

import type { Position, Street } from '../types';
import type { HandHistory, HandHistoryList } from '../types';
import { handHistoryRepository, type HandHistoryQuery } from '../persistence';
import { ServiceError } from './session-service';

// ============================================================
// Queries
// ============================================================

export async function listHandHistory(params: {
  cursor?: string;
  limit?: number;
  sessionId?: string;
  position?: Position;
  street?: Street;
} = {}): Promise<HandHistoryList> {
  const query: HandHistoryQuery = {
    cursor: params.cursor,
    limit: params.limit,
    sessionId: params.sessionId,
    position: params.position,
    street: params.street,
  };

  return handHistoryRepository.list(query);
}

export async function getHandHistory(handId: string): Promise<HandHistory> {
  const hand = await handHistoryRepository.getById(handId);
  if (!hand) {
    throw new ServiceError('HAND_NOT_FOUND', `No hand history found with ID ${handId}`);
  }
  return hand;
}

// ============================================================
// Mutations
// ============================================================

export async function deleteHandHistory(handId: string): Promise<void> {
  const deleted = await handHistoryRepository.delete(handId);
  if (!deleted) {
    throw new ServiceError('HAND_NOT_FOUND', `No hand history found with ID ${handId}`);
  }
}
