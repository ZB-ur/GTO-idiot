import type {
  HandRecord,
  HandState,
  ActionType,
  GtoComparisonResult,
} from '../types';

let currentRecording: Partial<HandRecord> | null = null;

export function startRecording(handState: HandState, sessionId: string): void {
  currentRecording = {
    handId: handState.handId,
    handNumber: handState.handNumber,
    sessionId,
    timestamp: new Date().toISOString(),
    userSeatIndex: 0,
    userHoleCards: handState.userHoleCards,
    communityCards: [],
    players: [],
    actions: [],
    gtoConformance: 0,
    gtoRating: 'gray',
    userDecisionCount: 0,
    gtoMatchCount: 0,
    isComplete: false,
  };
}

export function recordAction(
  seatIndex: number,
  actionType: ActionType,
  amount: number,
  gtoComparison?: GtoComparisonResult
): void {
  if (!currentRecording) return;
  void seatIndex;
  void actionType;
  void amount;
  void gtoComparison;
}

export function completeRecording(handState: HandState): HandRecord | null {
  if (!currentRecording) return null;
  const record: HandRecord = {
    ...(currentRecording as HandRecord),
    communityCards: handState.communityCards,
    result: handState.result!,
    isComplete: true,
  };
  currentRecording = null;
  return record;
}
