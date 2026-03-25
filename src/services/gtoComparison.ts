import type {
  ActionType,
  HandState,
  GtoComparisonResult,
} from '../types';

export function compareUserAction(
  handState: HandState,
  userAction: ActionType,
  userAmount?: number
): GtoComparisonResult {
  const userSeat = handState.players.find(
    (_, i) => i === handState.currentActorSeatIndex
  );
  return {
    userAction,
    userAmount,
    gtoRecommendedAction: 'fold',
    rating: 'gray',
    reason: 'No GTO data available',
    reasonZh: '无 GTO 数据',
    isSimplified: true,
    street: handState.street,
    position: userSeat?.position ?? 'BTN',
    hand: '',
  };
}
